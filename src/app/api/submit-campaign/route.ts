import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendCampaignSubmissionEmail } from '@/lib/email';

const VALID_CATEGORIES = [
    'Humanitarian', 'Education', 'Healthcare', 'Environment',
    'Culture', 'Infrastructure', 'Animal Welfare', 'Technology',
    'Community', 'Emergency',
];

const MAX_LENGTHS: Record<string, number> = {
    organizationName: 200,
    representativeName: 100,
    representativeEmail: 254,
    representativePhone: 20,
    representativeRole: 100,
    description: 5000,
    walletAddress: 44,
    verificationDetails: 3000,
    locationAddress: 500,
    locationCoords: 50,
    province: 100,
    district: 100,
    municipality: 100,
};

function sanitize(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ');
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidSolanaAddress(address: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function isValidPhone(phone: string): boolean {
    return /^\+?[\d\s\-()]{7,20}$/.test(phone);
}

function exceedsMax(value: string, field: string): boolean {
    return MAX_LENGTHS[field] ? value.length > MAX_LENGTHS[field] : false;
}

export async function POST(request: NextRequest) {
    try {
        // Validate content type
        const contentType = request.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            return NextResponse.json(
                { error: 'Content-Type must be application/json' },
                { status: 415 }
            );
        }

        let body: Record<string, unknown>;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        // Sanitize all inputs
        const organizationName = sanitize(body.organizationName);
        const representativeName = sanitize(body.representativeName);
        const representativeEmail = sanitize(body.representativeEmail);
        const representativePhone = sanitize(body.representativePhone);
        const representativeRole = sanitize(body.representativeRole);
        const description = typeof body.description === 'string' ? body.description.trim() : '';
        const walletAddress = sanitize(body.walletAddress);
        const verificationDetails = typeof body.verificationDetails === 'string' ? body.verificationDetails.trim() : '';
        const eventDate = sanitize(body.eventDate);
        const locationAddress = sanitize(body.locationAddress);
        const locationCoords = sanitize(body.locationCoords);
        const province = sanitize(body.province);
        const district = sanitize(body.district);
        const municipality = sanitize(body.municipality);
        const category = sanitize(body.category);
        const goalAmount = typeof body.goalAmount === 'number' ? body.goalAmount : parseFloat(String(body.goalAmount)) || 0;
        const officialLinks = Array.isArray(body.officialLinks)
            ? body.officialLinks
                  .filter((l): l is string => typeof l === 'string' && l.trim().length > 0)
                  .map(l => l.trim())
            : [];

        // Field-level validation
        const fieldErrors: Record<string, string> = {};

        if (!organizationName) fieldErrors.organizationName = 'Organization name is required';
        else if (organizationName.length < 3) fieldErrors.organizationName = 'Organization name must be at least 3 characters';
        else if (exceedsMax(organizationName, 'organizationName')) fieldErrors.organizationName = 'Organization name is too long';

        if (!representativeName) fieldErrors.representativeName = 'Representative name is required';
        else if (exceedsMax(representativeName, 'representativeName')) fieldErrors.representativeName = 'Name is too long';

        if (representativeEmail && !isValidEmail(representativeEmail)) fieldErrors.representativeEmail = 'Invalid email address format';
        if (representativePhone && !isValidPhone(representativePhone)) fieldErrors.representativePhone = 'Invalid phone number format';

        if (!description) fieldErrors.description = 'Description is required';
        else if (description.length < 50) fieldErrors.description = 'Description must be at least 50 characters';
        else if (exceedsMax(description, 'description')) fieldErrors.description = 'Description is too long';

        if (!walletAddress) fieldErrors.walletAddress = 'Wallet address is required';
        else if (!isValidSolanaAddress(walletAddress)) fieldErrors.walletAddress = 'Invalid Solana wallet address format';

        if (!verificationDetails) fieldErrors.verificationDetails = 'Verification details are required';
        else if (exceedsMax(verificationDetails, 'verificationDetails')) fieldErrors.verificationDetails = 'Verification details are too long';

        if (!eventDate) {
            fieldErrors.eventDate = 'Event date is required';
        } else {
            const parsedDate = new Date(eventDate);
            if (isNaN(parsedDate.getTime())) fieldErrors.eventDate = 'Invalid date format';
            else if (parsedDate < new Date()) fieldErrors.eventDate = 'Event date must be in the future';
        }

        if (!locationAddress) fieldErrors.locationAddress = 'Location address is required';
        else if (exceedsMax(locationAddress, 'locationAddress')) fieldErrors.locationAddress = 'Location address is too long';

        if (!locationCoords) fieldErrors.locationCoords = 'Location coordinates are required';
        else if (!/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(locationCoords)) {
            fieldErrors.locationCoords = 'Invalid coordinate format (expected: lat,lng)';
        }

        if (category && !VALID_CATEGORIES.includes(category)) fieldErrors.category = 'Invalid category';

        if (goalAmount < 0) fieldErrors.goalAmount = 'Goal amount cannot be negative';
        else if (goalAmount > 1_000_000) fieldErrors.goalAmount = 'Goal amount exceeds maximum limit';

        if (officialLinks.length > 5) fieldErrors.officialLinks = 'Maximum 5 links allowed';
        else if (officialLinks.some(l => l.length > 500)) fieldErrors.officialLinks = 'Link URL is too long';

        if (Object.keys(fieldErrors).length > 0) {
            return NextResponse.json(
                { error: 'Validation failed', fieldErrors },
                { status: 400 }
            );
        }

        const supabase = createServerSupabase();

        // Check for recent duplicate submissions (same org + wallet in last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: existing } = await supabase
            .from('campaigns_pending')
            .select('id')
            .eq('organization_name', organizationName)
            .eq('wallet_address', walletAddress)
            .gte('created_at', oneHourAgo)
            .limit(1);

        if (existing && existing.length > 0) {
            return NextResponse.json(
                { error: 'A similar campaign was recently submitted. Please wait before resubmitting.' },
                { status: 429 }
            );
        }

        const { data, error } = await supabase
            .from('campaigns_pending')
            .insert({
                organization_name: organizationName,
                representative_name: representativeName,
                representative_email: representativeEmail || null,
                representative_phone: representativePhone || null,
                representative_role: representativeRole || null,
                description,
                wallet_address: walletAddress,
                official_links: officialLinks,
                verification_details: verificationDetails,
                event_date: eventDate,
                location_address: locationAddress,
                location_coords: locationCoords,
                province: province || null,
                district: district || null,
                municipality: municipality || null,
                category: category || 'Humanitarian',
                goal_amount: goalAmount,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json(
                { error: 'Failed to submit campaign. Please try again.' },
                { status: 500 }
            );
        }

        // Send confirmation email (non-blocking, fire-and-forget)
        if (representativeEmail) {
            sendCampaignSubmissionEmail({
                to: representativeEmail,
                organizationName,
                representativeName,
                campaignId: data.id,
            }).catch((emailError) => {
                console.error('Email send error:', emailError);
            });
        }

        return NextResponse.json({
            success: true,
            campaignId: data.id,
            message: 'Campaign submitted for verification',
        }, { status: 201 });
    } catch (error) {
        console.error('Submit campaign error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

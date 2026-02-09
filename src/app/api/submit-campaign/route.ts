import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendCampaignSubmissionEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            organizationName,
            representativeName,
            representativeEmail,
            representativePhone,
            representativeRole,
            description,
            walletAddress,
            officialLinks,
            verificationDetails,
            eventDate,
            locationAddress,
            locationCoords,
            province,
            district,
            municipality,
            category,
            goalAmount,
        } = body;

        // Validate required fields
        if (!organizationName || !representativeName || !description || !walletAddress || !verificationDetails || !eventDate || !locationAddress || !locationCoords) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate Solana wallet address format
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
            return NextResponse.json({ error: 'Invalid Solana wallet address' }, { status: 400 });
        }

        const supabase = createServerSupabase();

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
                official_links: officialLinks?.filter((l: string) => l.trim()) || [],
                verification_details: verificationDetails,
                event_date: eventDate,
                location_address: locationAddress,
                location_coords: locationCoords,
                province: province || null,
                district: district || null,
                municipality: municipality || null,
                category: category || 'Humanitarian',
                goal_amount: goalAmount || 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: 'Failed to submit campaign' }, { status: 500 });
        }

        // Send confirmation email if email provided
        if (representativeEmail) {
            try {
                await sendCampaignSubmissionEmail({
                    to: representativeEmail,
                    organizationName,
                    representativeName,
                    campaignId: data.id,
                });
            } catch (emailError) {
                console.error('Email send error:', emailError);
                // Don't fail the submission if email fails
            }
        }

        return NextResponse.json({
            success: true,
            campaignId: data.id,
            message: 'Campaign submitted for verification',
        });
    } catch (error) {
        console.error('Submit campaign error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

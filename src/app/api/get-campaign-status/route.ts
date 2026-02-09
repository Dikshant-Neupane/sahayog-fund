import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import campaignsData from '@/app/lib/campaigns.json';

interface StaticCampaign {
    id: string;
    title: string;
    organizer: string;
    verified: boolean;
    category: string;
    location: string;
    [key: string]: unknown;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }

        // First check static campaigns (campaign-001 through campaign-026)
        const staticCampaign = (campaignsData as StaticCampaign[]).find(
            (c) => c.id.toLowerCase() === campaignId.trim().toLowerCase()
        );

        if (staticCampaign) {
            return NextResponse.json({
                campaignId: staticCampaign.id,
                organizationName: staticCampaign.organizer,
                status: staticCampaign.verified ? 'verified' : 'pending',
                notes: staticCampaign.verified
                    ? `This campaign has been verified by SahayogFund. Category: ${staticCampaign.category}. Location: ${staticCampaign.location}.`
                    : null,
                scheduledDate: null,
                submittedAt: '2025-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
            });
        }

        // Fallback to Supabase for user-submitted campaigns
        const supabase = createServerSupabase();

        const { data, error } = await supabase
            .from('campaigns_pending')
            .select('id, organization_name, verification_status, verification_notes, scheduled_date, created_at, updated_at')
            .eq('id', campaignId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        return NextResponse.json({
            campaignId: data.id,
            organizationName: data.organization_name,
            status: data.verification_status,
            notes: data.verification_notes,
            scheduledDate: data.scheduled_date,
            submittedAt: data.created_at,
            updatedAt: data.updated_at,
        });
    } catch (error) {
        console.error('Get campaign status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

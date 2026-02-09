import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
        }

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

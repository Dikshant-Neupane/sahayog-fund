import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { campaignId, scheduledDate, scheduledBy, meetingType, meetingLink, notes } = body;

        if (!campaignId || !scheduledDate || !scheduledBy || !meetingType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate admin
        const adminWallets = (process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim());
        if (!adminWallets.includes(scheduledBy)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const supabase = createServerSupabase();

        // Create appointment
        const { data, error } = await supabase
            .from('verification_appointments')
            .insert({
                campaign_pending_id: campaignId,
                scheduled_date: scheduledDate,
                scheduled_by: scheduledBy,
                meeting_type: meetingType,
                meeting_link: meetingLink || null,
                notes: notes || null,
                status: 'scheduled',
            })
            .select()
            .single();

        if (error) {
            console.error('Schedule appointment error:', error);
            return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 500 });
        }

        // Update campaign status to 'scheduled'
        await supabase
            .from('campaigns_pending')
            .update({
                verification_status: 'scheduled',
                scheduled_date: scheduledDate,
            })
            .eq('id', campaignId);

        // Log admin action
        await supabase.from('admin_actions_log').insert({
            admin_wallet: scheduledBy,
            action: 'schedule_appointment',
            target_id: campaignId,
            target_type: 'campaign',
            details: { appointmentId: data.id, scheduledDate, meetingType },
        });

        return NextResponse.json({
            success: true,
            appointmentId: data.id,
        });
    } catch (error) {
        console.error('Schedule appointment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

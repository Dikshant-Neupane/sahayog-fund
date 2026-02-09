import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { sendVerificationStatusEmail } from '@/lib/email';

// Admin-only: Update verification status of a campaign
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { campaignId, status, notes, adminWallet } = body;

        if (!campaignId || !status || !adminWallet) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate admin wallet
        const adminWallets = (process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim());
        if (!adminWallets.includes(adminWallet)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const validStatuses = ['pending', 'scheduled', 'verified', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const supabase = createServerSupabase();

        // Update campaign status
        const updateData: Record<string, unknown> = {
            verification_status: status,
            verification_notes: notes || null,
        };

        if (status === 'verified') {
            updateData.verification_date = new Date().toISOString();
        }

        // Fetch previous status before updating
        const { data: existingCampaign } = await supabase
            .from('campaigns_pending')
            .select('verification_status')
            .eq('id', campaignId)
            .single();
        const previousStatus = existingCampaign?.verification_status || 'unknown';

        const { data: campaign, error } = await supabase
            .from('campaigns_pending')
            .update(updateData)
            .eq('id', campaignId)
            .select()
            .single();

        if (error || !campaign) {
            return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
        }

        // If verified, create approved campaign entry
        if (status === 'verified') {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 180); // 180-day campaign

            await supabase.from('campaigns_approved').insert({
                campaign_pending_id: campaign.id,
                organization_name: campaign.organization_name,
                representative_name: campaign.representative_name,
                representative_email: campaign.representative_email,
                representative_phone: campaign.representative_phone,
                representative_role: campaign.representative_role,
                representative_photo_url: campaign.representative_photo_url,
                description: campaign.description,
                wallet_address: campaign.wallet_address,
                official_links: campaign.official_links,
                category: campaign.category,
                goal_amount: campaign.goal_amount,
                location_address: campaign.location_address,
                location_coords: campaign.location_coords,
                province: campaign.province,
                district: campaign.district,
                municipality: campaign.municipality,
                end_date: endDate.toISOString(),
                is_active: true,
                verified_at: new Date().toISOString(),
            });
        }

        // Log admin action
        await supabase.from('admin_actions_log').insert({
            admin_wallet: adminWallet,
            action: `update_status_${status}`,
            target_id: campaignId,
            target_type: 'campaign',
            details: { notes, previousStatus },
        });

        // Send email notification
        if (campaign.representative_email) {
            try {
                await sendVerificationStatusEmail({
                    to: campaign.representative_email,
                    organizationName: campaign.organization_name,
                    representativeName: campaign.representative_name,
                    status,
                    notes,
                    campaignId: campaign.id,
                });
            } catch (emailError) {
                console.error('Email notification error:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            campaignId: campaign.id,
            status,
        });
    } catch (error) {
        console.error('Update verification status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

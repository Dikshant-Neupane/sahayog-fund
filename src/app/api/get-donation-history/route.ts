import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');
        const donorWallet = searchParams.get('donorWallet');
        const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
        const limit = Number.isNaN(rawLimit) ? 50 : rawLimit;

        const supabase = createServerSupabase();

        let query = supabase
            .from('donations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(Math.min(limit, 100));

        if (campaignId) {
            query = query.eq('campaign_id', campaignId);
        }

        if (donorWallet) {
            query = query.eq('donor_wallet', donorWallet);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Get donation history error:', error);
            return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
        }

        return NextResponse.json({
            donations: data.map(d => ({
                id: d.id,
                campaignId: d.campaign_id,
                donorWallet: d.is_anonymous ? 'Anonymous' : d.donor_wallet,
                donorName: d.is_anonymous ? 'Anonymous Donor' : d.donor_name,
                donorMessage: d.donor_message,
                amountSol: d.amount_sol,
                txSignature: d.tx_signature,
                isAnonymous: d.is_anonymous,
                createdAt: d.created_at,
            })),
            total: data.length,
        });
    } catch (error) {
        console.error('Get donation history error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            campaignId,
            donorWallet,
            donorName,
            donorMessage,
            amountSol,
            amountLamports,
            txSignature,
            isAnonymous,
        } = body;

        if (!campaignId || !donorWallet || !amountSol || !txSignature) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createServerSupabase();

        const { data, error } = await supabase
            .from('donations')
            .insert({
                campaign_id: campaignId,
                donor_wallet: donorWallet,
                donor_name: isAnonymous ? null : (donorName || null),
                donor_message: donorMessage || null,
                amount_sol: amountSol,
                amount_lamports: amountLamports || Math.floor(amountSol * 1_000_000_000),
                tx_signature: txSignature,
                is_anonymous: isAnonymous || false,
            })
            .select()
            .single();

        if (error) {
            console.error('Insert donation error:', error);
            return NextResponse.json({ error: 'Failed to record donation' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            donationId: data.id,
        });
    } catch (error) {
        console.error('Submit donation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

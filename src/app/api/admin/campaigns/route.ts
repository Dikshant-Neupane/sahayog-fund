import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Admin authorization check
        const { searchParams } = new URL(request.url);
        const adminWallet = searchParams.get('adminWallet');
        const adminWallets = (process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim()).filter(Boolean);
        if (!adminWallet || !adminWallets.includes(adminWallet)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const supabase = createServerSupabase();
        const { data, error } = await supabase
            .from('campaigns_pending')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ campaigns: data || [] });
    } catch (err) {
        console.error('Error fetching campaigns:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

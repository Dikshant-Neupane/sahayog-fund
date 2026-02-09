import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET() {
    try {
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

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy-initialized client to avoid crashing at build time when env vars are missing
let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabase) {
            if (!supabaseUrl) {
                throw new Error(
                    'NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your environment variables.'
                );
            }
            _supabase = createClient(supabaseUrl, supabaseAnonKey);
        }
        return (_supabase as unknown as Record<string, unknown>)[prop as string];
    },
});

// Server-side Supabase client (uses service role key, bypasses RLS)
export function createServerSupabase() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl) {
        throw new Error(
            'NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your environment variables.'
        );
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

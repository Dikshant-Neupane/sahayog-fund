// Auto-generated types for Supabase database schema
// Run the Supabase SQL migration in supabase/schema.sql to create these tables

export type VerificationStatus = 'pending' | 'scheduled' | 'verified' | 'rejected';

export interface Database {
    public: {
        Tables: {
            campaigns_pending: {
                Row: {
                    id: string;
                    organization_name: string;
                    representative_name: string;
                    representative_email: string | null;
                    representative_phone: string | null;
                    representative_role: string | null;
                    representative_photo_url: string | null;
                    description: string;
                    wallet_address: string;
                    official_links: string[];
                    verification_details: string;
                    event_date: string;
                    location_address: string;
                    location_coords: string;
                    province: string | null;
                    district: string | null;
                    municipality: string | null;
                    category: string;
                    goal_amount: number;
                    ngo_registration_url: string | null;
                    tax_exemption_url: string | null;
                    representative_id_url: string | null;
                    verification_status: VerificationStatus;
                    verification_notes: string | null;
                    verification_date: string | null;
                    scheduled_date: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['campaigns_pending']['Row'], 'id' | 'created_at' | 'updated_at' | 'verification_status'> & {
                    id?: string;
                    verification_status?: VerificationStatus;
                };
                Update: Partial<Database['public']['Tables']['campaigns_pending']['Row']>;
            };
            campaigns_approved: {
                Row: {
                    id: string;
                    campaign_pending_id: string;
                    organization_name: string;
                    representative_name: string;
                    representative_email: string | null;
                    representative_phone: string | null;
                    representative_role: string | null;
                    representative_photo_url: string | null;
                    description: string;
                    wallet_address: string;
                    official_links: string[];
                    category: string;
                    goal_amount: number;
                    raised_amount: number;
                    location_address: string;
                    location_coords: string;
                    province: string | null;
                    district: string | null;
                    municipality: string | null;
                    end_date: string;
                    is_active: boolean;
                    verified_at: string;
                    verification_report_url: string | null;
                    office_photos: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['campaigns_approved']['Row'], 'id' | 'created_at' | 'updated_at' | 'raised_amount'> & {
                    id?: string;
                    raised_amount?: number;
                };
                Update: Partial<Database['public']['Tables']['campaigns_approved']['Row']>;
            };
            donations: {
                Row: {
                    id: string;
                    campaign_id: string;
                    donor_wallet: string;
                    donor_name: string | null;
                    donor_message: string | null;
                    amount_sol: number;
                    amount_lamports: string;
                    tx_signature: string;
                    is_anonymous: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['donations']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['donations']['Row']>;
            };
            verification_appointments: {
                Row: {
                    id: string;
                    campaign_pending_id: string;
                    scheduled_date: string;
                    scheduled_by: string;
                    meeting_type: 'in_person' | 'video_call' | 'phone_call';
                    meeting_link: string | null;
                    notes: string | null;
                    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['verification_appointments']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['verification_appointments']['Row']>;
            };
            verification_reports: {
                Row: {
                    id: string;
                    campaign_pending_id: string;
                    verifier_name: string;
                    site_visit_date: string | null;
                    checklist: Record<string, boolean>;
                    notes: string;
                    office_photos: string[];
                    recommendation: 'approve' | 'reject' | 'needs_more_info';
                    report_pdf_url: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['verification_reports']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['verification_reports']['Row']>;
            };
            admin_actions_log: {
                Row: {
                    id: string;
                    admin_wallet: string;
                    action: string;
                    target_id: string;
                    target_type: string;
                    details: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['admin_actions_log']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['admin_actions_log']['Row']>;
            };
        };
    };
}

-- ===== SahayogFund Database Schema =====
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== Campaigns Pending (submitted, awaiting verification) =====
CREATE TABLE IF NOT EXISTS campaigns_pending (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name TEXT NOT NULL,
    representative_name TEXT NOT NULL,
    representative_email TEXT,
    representative_phone TEXT,
    representative_role TEXT,
    representative_photo_url TEXT,
    description TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    official_links TEXT[] DEFAULT '{}',
    verification_details TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location_address TEXT NOT NULL,
    location_coords TEXT NOT NULL,
    province TEXT,
    district TEXT,
    municipality TEXT,
    category TEXT NOT NULL DEFAULT 'Humanitarian',
    goal_amount NUMERIC(12,4) NOT NULL DEFAULT 0,
    -- Document uploads
    ngo_registration_url TEXT,
    tax_exemption_url TEXT,
    representative_id_url TEXT,
    -- Verification workflow
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'scheduled', 'verified', 'rejected')),
    verification_notes TEXT,
    verification_date TIMESTAMPTZ,
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Campaigns Approved (verified and live) =====
CREATE TABLE IF NOT EXISTS campaigns_approved (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_pending_id UUID REFERENCES campaigns_pending(id),
    organization_name TEXT NOT NULL,
    representative_name TEXT NOT NULL,
    representative_email TEXT,
    representative_phone TEXT,
    representative_role TEXT,
    representative_photo_url TEXT,
    description TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    official_links TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    goal_amount NUMERIC(12,4) NOT NULL,
    raised_amount NUMERIC(12,4) DEFAULT 0,
    location_address TEXT NOT NULL,
    location_coords TEXT NOT NULL,
    province TEXT,
    district TEXT,
    municipality TEXT,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMPTZ NOT NULL,
    verification_report_url TEXT,
    office_photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Donations =====
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id TEXT NOT NULL,
    donor_wallet TEXT NOT NULL,
    donor_name TEXT,
    donor_message TEXT,
    amount_sol NUMERIC(12,9) NOT NULL,
    amount_lamports BIGINT NOT NULL,
    tx_signature TEXT NOT NULL UNIQUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Verification Appointments =====
CREATE TABLE IF NOT EXISTS verification_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_pending_id UUID REFERENCES campaigns_pending(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    scheduled_by TEXT NOT NULL,
    meeting_type TEXT NOT NULL CHECK (meeting_type IN ('in_person', 'video_call', 'phone_call')),
    meeting_link TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Verification Reports =====
CREATE TABLE IF NOT EXISTS verification_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_pending_id UUID REFERENCES campaigns_pending(id) ON DELETE CASCADE,
    verifier_name TEXT NOT NULL,
    site_visit_date TIMESTAMPTZ,
    checklist JSONB DEFAULT '{}',
    notes TEXT NOT NULL,
    office_photos TEXT[] DEFAULT '{}',
    recommendation TEXT NOT NULL CHECK (recommendation IN ('approve', 'reject', 'needs_more_info')),
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Admin Actions Log =====
CREATE TABLE IF NOT EXISTS admin_actions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_wallet TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_campaigns_pending_status ON campaigns_pending(verification_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_pending_wallet ON campaigns_pending(wallet_address);
CREATE INDEX IF NOT EXISTS idx_campaigns_approved_active ON campaigns_approved(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_approved_category ON campaigns_approved(category);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_wallet);
CREATE INDEX IF NOT EXISTS idx_donations_tx ON donations(tx_signature);
CREATE INDEX IF NOT EXISTS idx_verification_appointments_campaign ON verification_appointments(campaign_pending_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_wallet ON admin_actions_log(admin_wallet);

-- ===== Auto-update updated_at trigger =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_pending_updated_at
    BEFORE UPDATE ON campaigns_pending
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_approved_updated_at
    BEFORE UPDATE ON campaigns_approved
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_appointments_updated_at
    BEFORE UPDATE ON verification_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===== Storage Buckets (run in Supabase Dashboard > Storage) =====
-- Create buckets: 'documents', 'photos'
-- documents: for NGO certs, tax docs, ID cards
-- photos: for representative photos, office photos

-- ===== RLS Policies =====
-- Enable RLS on all tables
ALTER TABLE campaigns_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns_approved ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;

-- Public read access for approved campaigns
CREATE POLICY "Public can view approved campaigns" ON campaigns_approved
    FOR SELECT USING (TRUE);

-- Public can view donations
CREATE POLICY "Public can view donations" ON donations
    FOR SELECT USING (TRUE);

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access campaigns_pending" ON campaigns_pending
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access campaigns_approved" ON campaigns_approved
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access donations" ON donations
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access verification_appointments" ON verification_appointments
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access verification_reports" ON verification_reports
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access admin_actions_log" ON admin_actions_log
    FOR ALL USING (TRUE) WITH CHECK (TRUE);

"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import toast, { Toaster } from "react-hot-toast";

interface PendingCampaign {
    id: string;
    organization_name: string;
    representative_name: string;
    representative_email: string | null;
    representative_phone: string | null;
    description: string;
    wallet_address: string;
    category: string;
    goal_amount: number;
    location_address: string;
    verification_status: string;
    verification_notes: string | null;
    ngo_registration_url: string | null;
    tax_exemption_url: string | null;
    representative_id_url: string | null;
    representative_photo_url: string | null;
    created_at: string;
    scheduled_date: string | null;
}

export default function AdminDashboard() {
    const { publicKey, connected } = useWallet();
    const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState<PendingCampaign | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [actionNotes, setActionNotes] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [meetingType, setMeetingType] = useState("video_call");
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Check admin authorization
    useEffect(() => {
        if (connected && publicKey) {
            const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim());
            setIsAuthorized(adminWallets.includes(publicKey.toString()));
        } else {
            setIsAuthorized(false);
        }
    }, [connected, publicKey]);

    const fetchCampaigns = useCallback(async () => {
        if (!isAuthorized) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/campaigns');
            const data = await res.json();
            if (data.campaigns) {
                setCampaigns(data.campaigns);
            }
        } catch {
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    }, [isAuthorized]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const updateStatus = async (campaignId: string, status: string) => {
        if (!publicKey) return;
        try {
            const res = await fetch('/api/update-verification-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    status,
                    notes: actionNotes,
                    adminWallet: publicKey.toString(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Campaign ${status}!`);
                setActionNotes("");
                setSelectedCampaign(null);
                fetchCampaigns();
            } else {
                toast.error(data.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    const scheduleAppointment = async (campaignId: string) => {
        if (!publicKey || !scheduleDate) {
            toast.error("Please select a date");
            return;
        }
        try {
            const res = await fetch('/api/schedule-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    scheduledDate: scheduleDate,
                    scheduledBy: publicKey.toString(),
                    meetingType,
                    notes: actionNotes,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Appointment scheduled!");
                setScheduleDate("");
                setActionNotes("");
                fetchCampaigns();
            } else {
                toast.error(data.error || "Failed to schedule");
            }
        } catch {
            toast.error("Failed to schedule appointment");
        }
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (statusFilter !== "all" && c.verification_status !== statusFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return c.organization_name.toLowerCase().includes(q) ||
                c.representative_name.toLowerCase().includes(q) ||
                c.wallet_address.toLowerCase().includes(q);
        }
        return true;
    });

    const statusCounts = {
        all: campaigns.length,
        pending: campaigns.filter(c => c.verification_status === 'pending').length,
        scheduled: campaigns.filter(c => c.verification_status === 'scheduled').length,
        verified: campaigns.filter(c => c.verification_status === 'verified').length,
        rejected: campaigns.filter(c => c.verification_status === 'rejected').length,
    };

    if (!connected) {
        return (
            <div className="admin-page">
                <Toaster position="top-right" />
                <div className="admin-auth-msg">
                    <h1>🔒 Admin Dashboard</h1>
                    <p>Connect your admin wallet to access the dashboard.</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="admin-page">
                <Toaster position="top-right" />
                <div className="admin-auth-msg">
                    <h1>⛔ Access Denied</h1>
                    <p>Your wallet is not authorized for admin access.</p>
                    <code>{publicKey?.toString()}</code>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Toaster position="top-right" />
            <header className="admin-header">
                <h1>🏛️ Admin Dashboard</h1>
                <p>Manage campaign verifications and appointments</p>
            </header>

            {/* Stats Bar */}
            <div className="admin-stats-bar">
                {Object.entries(statusCounts).map(([key, count]) => (
                    <button
                        key={key}
                        className={`admin-stat-card ${statusFilter === key ? 'active' : ''}`}
                        onClick={() => setStatusFilter(key)}
                    >
                        <span className="admin-stat-count">{count}</span>
                        <span className="admin-stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="admin-search">
                <input
                    type="text"
                    placeholder="Search by organization, name, or wallet..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Campaign List */}
            <div className="admin-campaigns">
                {loading ? (
                    <div className="admin-loading">Loading campaigns...</div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="admin-empty">No campaigns found</div>
                ) : (
                    filteredCampaigns.map(campaign => (
                        <div key={campaign.id} className={`admin-campaign-card status-${campaign.verification_status}`}>
                            <div className="campaign-card-header">
                                <div>
                                    <h3>{campaign.organization_name}</h3>
                                    <p className="campaign-rep">By: {campaign.representative_name}</p>
                                </div>
                                <span className={`status-badge status-${campaign.verification_status}`}>
                                    {campaign.verification_status}
                                </span>
                            </div>
                            <div className="campaign-card-body">
                                <p className="campaign-desc">{campaign.description.substring(0, 150)}...</p>
                                <div className="campaign-meta-grid">
                                    <div><strong>Category:</strong> {campaign.category}</div>
                                    <div><strong>Goal:</strong> {campaign.goal_amount} SOL</div>
                                    <div><strong>Location:</strong> {campaign.location_address}</div>
                                    <div><strong>Wallet:</strong> <code>{campaign.wallet_address.slice(0, 8)}...{campaign.wallet_address.slice(-6)}</code></div>
                                    <div><strong>Submitted:</strong> {new Date(campaign.created_at).toLocaleDateString()}</div>
                                    {campaign.representative_email && <div><strong>Email:</strong> {campaign.representative_email}</div>}
                                    {campaign.representative_phone && <div><strong>Phone:</strong> <a href={`tel:${campaign.representative_phone}`}>{campaign.representative_phone}</a></div>}
                                </div>

                                {/* Documents */}
                                <div className="campaign-docs">
                                    <strong>Documents:</strong>
                                    <div className="doc-links">
                                        {campaign.ngo_registration_url && <a href={campaign.ngo_registration_url} target="_blank" rel="noopener noreferrer">📄 NGO Cert</a>}
                                        {campaign.tax_exemption_url && <a href={campaign.tax_exemption_url} target="_blank" rel="noopener noreferrer">📋 Tax Doc</a>}
                                        {campaign.representative_id_url && <a href={campaign.representative_id_url} target="_blank" rel="noopener noreferrer">🪪 ID Card</a>}
                                        {campaign.representative_photo_url && <a href={campaign.representative_photo_url} target="_blank" rel="noopener noreferrer">📸 Photo</a>}
                                        {!campaign.ngo_registration_url && !campaign.tax_exemption_url && !campaign.representative_id_url && <span className="no-docs">No documents uploaded</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="campaign-card-actions">
                                <button onClick={() => setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)} className="btn-details">
                                    {selectedCampaign?.id === campaign.id ? 'Close' : 'Actions'}
                                </button>
                            </div>

                            {/* Expanded Action Panel */}
                            {selectedCampaign?.id === campaign.id && (
                                <div className="campaign-action-panel">
                                    <h4>Take Action</h4>
                                    <textarea
                                        placeholder="Notes / reason for decision..."
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        rows={3}
                                    />

                                    {/* Schedule Appointment */}
                                    {campaign.verification_status === 'pending' && (
                                        <div className="schedule-section">
                                            <h5>Schedule Verification</h5>
                                            <div className="schedule-inputs">
                                                <input
                                                    type="datetime-local"
                                                    value={scheduleDate}
                                                    onChange={(e) => setScheduleDate(e.target.value)}
                                                />
                                                <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
                                                    <option value="video_call">Video Call</option>
                                                    <option value="phone_call">Phone Call</option>
                                                    <option value="in_person">In Person</option>
                                                </select>
                                                <button onClick={() => scheduleAppointment(campaign.id)} className="btn-schedule">
                                                    📅 Schedule
                                                </button>
                                            </div>
                                            {/* Calendly Embed Option */}
                                            <div className="calendly-option">
                                                <p>Or use Calendly:</p>
                                                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="btn-calendly">
                                                    Open Calendly →
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div className="action-buttons">
                                        {campaign.verification_status !== 'verified' && (
                                            <button onClick={() => updateStatus(campaign.id, 'verified')} className="btn-approve">✅ Approve</button>
                                        )}
                                        {campaign.verification_status !== 'rejected' && (
                                            <button onClick={() => updateStatus(campaign.id, 'rejected')} className="btn-reject">❌ Reject</button>
                                        )}
                                        {campaign.verification_status !== 'pending' && (
                                            <button onClick={() => updateStatus(campaign.id, 'pending')} className="btn-reset">↩️ Reset to Pending</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

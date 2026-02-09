"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import toast, { Toaster } from "react-hot-toast";

interface CampaignStatus {
    campaignId: string;
    organizationName: string;
    status: string;
    notes: string | null;
    scheduledDate: string | null;
    submittedAt: string;
    updatedAt: string;
}

export default function VerifyPage() {
    const router = useRouter();
    const [campaignId, setCampaignId] = useState("");
    const [status, setStatus] = useState<CampaignStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const checkStatus = async () => {
        if (!campaignId.trim()) {
            toast.error("Please enter a Campaign ID");
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/get-campaign-status?campaignId=${encodeURIComponent(campaignId.trim())}`);
            const data = await res.json();
            if (data.error) {
                setStatus(null);
                toast.error(data.error);
            } else {
                setStatus(data);
            }
        } catch {
            toast.error("Failed to check status");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'pending': return '⏳';
            case 'scheduled': return '📅';
            case 'verified': return '✅';
            case 'rejected': return '❌';
            default: return '❓';
        }
    };

    const getStatusDescription = (s: string) => {
        switch (s) {
            case 'pending': return 'Your campaign application is under review. Our team will evaluate your documents and reach out to schedule a verification meeting.';
            case 'scheduled': return 'A verification meeting has been scheduled. Please be available at the scheduled time.';
            case 'verified': return 'Your campaign has been verified and approved! It is now live on the platform and can receive donations.';
            case 'rejected': return 'Unfortunately, your campaign did not pass verification. Please check the notes below for details.';
            default: return '';
        }
    };

    const getTimelineSteps = () => {
        const steps: Array<{ label: string; icon: string; status: 'completed' | 'active' | 'pending' | 'rejected' }> = [
            { label: 'Application Submitted', icon: '📝', status: 'completed' },
            { label: 'Document Review', icon: '📋', status: 'completed' },
            { label: 'Verification Meeting', icon: '🤝', status: 'pending' },
            { label: 'Approved & Live', icon: '🚀', status: 'pending' },
        ];

        if (!status) return steps;

        switch (status.status) {
            case 'pending':
                steps[1].status = 'active';
                break;
            case 'scheduled':
                steps[1].status = 'completed';
                steps[2].status = 'active';
                break;
            case 'verified':
                steps[1].status = 'completed';
                steps[2].status = 'completed';
                steps[3].status = 'completed';
                break;
            case 'rejected':
                steps[1].status = 'completed';
                steps[2] = { label: 'Rejected', icon: '❌', status: 'rejected' };
                break;
        }
        return steps;
    };

    return (
        <div className="verify-page">
            <Navbar
                onLogoClick={() => router.push('/')}
                onBrowseCampaignsClick={() => router.push('/')}
                onStartCampaignClick={() => router.push('/')}
            />
            <Toaster position="top-right" />
            <div className="verify-container">
                <header className="verify-header">
                    <h1>🔍 Check Campaign Verification Status</h1>
                    <p>Enter your Campaign ID to track the verification progress of your campaign.</p>
                </header>

                <div className="verify-search-box">
                    <input
                        type="text"
                        placeholder="Enter Campaign ID (e.g., campaign-001)"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && checkStatus()}
                    />
                    <button onClick={checkStatus} disabled={loading}>
                        {loading ? 'Checking...' : 'Check Status'}
                    </button>
                </div>

                {searched && !loading && !status && (
                    <div className="verify-not-found">
                        <h3>Campaign Not Found</h3>
                        <p>No campaign was found with that ID. Please double-check your Campaign ID and try again.</p>
                    </div>
                )}

                {status && (
                    <div className="verify-result">
                        <div className="verify-status-card">
                            <div className="verify-status-header">
                                <span className="verify-status-icon">{getStatusIcon(status.status)}</span>
                                <div>
                                    <h2>{status.organizationName}</h2>
                                    <span className={`status-badge status-${status.status}`}>
                                        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            <p className="verify-status-desc">{getStatusDescription(status.status)}</p>

                            {status.notes && (
                                <div className="verify-notes">
                                    <strong>Notes from reviewer:</strong>
                                    <p>{status.notes}</p>
                                </div>
                            )}

                            {status.scheduledDate && (
                                <div className="verify-schedule">
                                    <strong>📅 Scheduled Meeting:</strong>
                                    <p>{new Date(status.scheduledDate).toLocaleString()}</p>
                                </div>
                            )}

                            <div className="verify-meta">
                                <span>Campaign ID: <code>{status.campaignId}</code></span>
                                <span>Submitted: {new Date(status.submittedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="verify-timeline">
                            <h3>Verification Timeline</h3>
                            <div className="timeline-steps">
                                {getTimelineSteps().map((step, i) => (
                                    <div key={i} className={`timeline-step step-${step.status}`}>
                                        <div className="timeline-step-dot">
                                            {step.status === 'completed' ? '✓' : step.status === 'active' ? '●' : step.status === 'rejected' ? '✕' : '○'}
                                        </div>
                                        <div className="timeline-step-content">
                                            <span className="timeline-step-icon">{step.icon}</span>
                                            <span className="timeline-step-label">{step.label}</span>
                                        </div>
                                        {i < 3 && <div className="timeline-step-line" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* How We Verify Section */}
                <section className="how-we-verify">
                    <h2>🛡️ How We Verify Campaigns</h2>
                    <p className="how-subtitle">Transparency and trust are at the core of SahayogFund. Here&apos;s our rigorous verification process.</p>

                    <div className="verify-process-grid">
                        <div className="verify-process-card">
                            <div className="process-icon">📝</div>
                            <h3>1. Application Review</h3>
                            <p>Every campaign application is reviewed by our team. We check the organization&apos;s registration documents, representative credentials, and campaign details.</p>
                        </div>
                        <div className="verify-process-card">
                            <div className="process-icon">📋</div>
                            <h3>2. Document Verification</h3>
                            <p>We verify NGO registration certificates, tax-exemption status, representative IDs, and cross-reference with Nepal government databases.</p>
                        </div>
                        <div className="verify-process-card">
                            <div className="process-icon">🤝</div>
                            <h3>3. In-Person / Video Meeting</h3>
                            <p>We schedule a meeting with the campaign representative to verify identity, confirm details, and visit the organization if possible.</p>
                        </div>
                        <div className="verify-process-card">
                            <div className="process-icon">📸</div>
                            <h3>4. Office Verification</h3>
                            <p>For local organizations, our team may visit the physical location to verify operations and take office photos for transparency.</p>
                        </div>
                        <div className="verify-process-card">
                            <div className="process-icon">✅</div>
                            <h3>5. Approval & Badge</h3>
                            <p>Approved campaigns receive a verified badge and are listed on the platform. The verification report is made available for donor transparency.</p>
                        </div>
                        <div className="verify-process-card">
                            <div className="process-icon">🔄</div>
                            <h3>6. Ongoing Monitoring</h3>
                            <p>Verified campaigns are monitored regularly. We require progress updates and can revoke verification if issues arise.</p>
                        </div>
                    </div>

                    <div className="verify-commitment">
                        <h3>🇳🇵 Our Commitment</h3>
                        <p>SahayogFund is built for the Nepal community. We are committed to ensuring every SOL donated reaches genuine causes. Our verification process is designed to prevent fraud while supporting legitimate fundraisers.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

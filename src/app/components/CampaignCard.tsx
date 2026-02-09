"use client";

import { memo, useMemo } from "react";
import Image from "next/image";

// Nepal-themed category styles with Crimson (#DC143C) and Blue (#003893) base
const CATEGORY_STYLES: Record<string, { bg: string; glow: string }> = {
    // Primary categories - Nepal Crimson variations
    Humanitarian: { bg: "linear-gradient(135deg, #DC143C 0%, #B91030 100%)", glow: "rgba(220, 20, 60, 0.4)" },
    Healthcare: { bg: "linear-gradient(135deg, #DC143C 0%, #E8365A 100%)", glow: "rgba(220, 20, 60, 0.35)" },
    Health: { bg: "linear-gradient(135deg, #E8365A 0%, #DC143C 100%)", glow: "rgba(232, 54, 90, 0.4)" },
    
    // Secondary categories - Nepal Blue variations
    Education: { bg: "linear-gradient(135deg, #003893 0%, #0047B3 100%)", glow: "rgba(0, 56, 147, 0.4)" },
    Technology: { bg: "linear-gradient(135deg, #0047B3 0%, #003893 100%)", glow: "rgba(0, 71, 179, 0.4)" },
    Infrastructure: { bg: "linear-gradient(135deg, #002D77 0%, #003893 100%)", glow: "rgba(0, 45, 119, 0.4)" },
    
    // Success green - Rhododendron leaves
    Environment: { bg: "linear-gradient(135deg, #22A35D 0%, #2EC96F 100%)", glow: "rgba(34, 163, 93, 0.4)" },
    Agriculture: { bg: "linear-gradient(135deg, #2EC96F 0%, #22A35D 100%)", glow: "rgba(46, 201, 111, 0.4)" },
    
    // Gradient combinations - Crimson to Blue
    "Women Empowerment": { bg: "linear-gradient(135deg, #DC143C 0%, #003893 100%)", glow: "rgba(220, 20, 60, 0.35)" },
    Culture: { bg: "linear-gradient(135deg, #E8365A 0%, #0047B3 100%)", glow: "rgba(220, 20, 60, 0.3)" },
    
    // Hope/Gold - Diya lamp inspired
    Energy: { bg: "linear-gradient(135deg, #F7B32B 0%, #FFD166 100%)", glow: "rgba(247, 179, 43, 0.4)" },
    Livelihood: { bg: "linear-gradient(135deg, #FFD166 0%, #F7B32B 100%)", glow: "rgba(255, 209, 102, 0.4)" },
    Business: { bg: "linear-gradient(135deg, #F7B32B 0%, #22A35D 100%)", glow: "rgba(247, 179, 43, 0.35)" },
    
    // Neutral/Support categories
    "Animal Welfare": { bg: "linear-gradient(135deg, #DC143C 0%, #F7B32B 100%)", glow: "rgba(220, 20, 60, 0.3)" },
    Housing: { bg: "linear-gradient(135deg, #003893 0%, #22A35D 100%)", glow: "rgba(0, 56, 147, 0.3)" },
    Accessibility: { bg: "linear-gradient(135deg, #0047B3 0%, #E8365A 100%)", glow: "rgba(0, 71, 179, 0.35)" },
};

const DEFAULT_CATEGORY_STYLE = {
    bg: "linear-gradient(135deg, #DC143C 0%, #003893 100%)",
    glow: "rgba(220, 20, 60, 0.3)"
};

// Utility function - also outside component
const formatBeneficiaries = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

interface Campaign {
    id: string;
    title: string;
    description: string;
    goal: number;
    raised: number;
    image: string;
    walletAddress: string;
    category: string;
    endDate: string;
    organizer: string;
    location: string;
    beneficiaries?: number;
    verified?: boolean;
    tags?: string[];
    representativeName?: string;
    representativeRole?: string;
    representativePhoto?: string;
}

interface CampaignCardProps {
    campaign: Campaign;
    onClick: (scrollToDonation?: boolean) => void;
}

const CampaignCard = memo(function CampaignCard({ campaign, onClick }: CampaignCardProps) {
    // Memoize calculated values to prevent recalculation on re-render
    const { progress, daysRemaining, isUrgent, isEnded, isAlmostFunded, isFunded } = useMemo(() => {
        const prog = Math.min((campaign.raised / campaign.goal) * 100, 100);
        const days = Math.max(
            0,
            Math.ceil(
                (new Date(campaign.endDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
        );
        return {
            progress: prog,
            daysRemaining: days,
            isUrgent: days <= 7 && days > 0,
            isEnded: days === 0,
            isAlmostFunded: prog >= 80 && prog < 100,
            isFunded: prog >= 100,
        };
    }, [campaign.raised, campaign.goal, campaign.endDate]);

    // Get category style from static map
    const categoryStyle = CATEGORY_STYLES[campaign.category] || DEFAULT_CATEGORY_STYLE;

    return (
        <article 
            className="campaign-card" 
            onClick={() => onClick(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(false);
                }
            }}
            aria-label={`${campaign.title} campaign. ${progress.toFixed(0)}% funded, ${daysRemaining} days remaining. Click to view details.`}
        >
            {/* Campaign Image */}
            <div className="card-image-container">
                <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="card-image"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="card-image-overlay" />

                {/* Gradient glow effect on hover */}
                <div
                    className="card-glow-effect"
                    style={{ background: categoryStyle.glow }}
                />

                {/* Category Badge with gradient */}
                <span
                    className="category-badge"
                    style={{ background: categoryStyle.bg }}
                >
                    {campaign.category}
                </span>

                {/* Status Badge (Days/Urgent/Funded) */}
                <div className={`status-badge ${isEnded ? 'ended' : isUrgent ? 'urgent' : isFunded ? 'funded' : ''}`}>
                    {isFunded ? (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="status-icon">
                                <path d="M9 12l2 2 4-4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            Funded!
                        </>
                    ) : isEnded ? (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="status-icon">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Ended
                        </>
                    ) : isUrgent ? (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="status-icon pulse">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="status-icon">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {daysRemaining} days left
                        </>
                    )}
                </div>

                {/* Verified Badge */}
                {campaign.verified && (
                    <div className="verified-badge" title="Verified Campaign">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="verified-icon">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="card-content">
                {/* Title Row */}
                <div className="card-title-row">
                    <h3 className="card-title">{campaign.title}</h3>
                    {isAlmostFunded && !isFunded && (
                        <span className="almost-funded-badge">🔥 Almost there!</span>
                    )}
                </div>

                {/* Organizer */}
                <p className="card-organizer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="organizer-icon">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    {campaign.organizer}
                    {campaign.verified && (
                        <span className="verification-badge">
                            <span className="badge-icon">✓</span> Verified
                        </span>
                    )}
                </p>

                {/* Description */}
                <p className="card-description">{campaign.description}</p>

                {/* Tags */}
                {campaign.tags && campaign.tags.length > 0 && (
                    <div className="card-tags">
                        {campaign.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Progress Section */}
                <div className="progress-section">
                    <div className="progress-bar-container">
                        <div
                            className={`progress-bar-fill ${isFunded ? 'funded' : isAlmostFunded ? 'almost' : ''}`}
                            style={{ width: `${progress}%` }}
                        />
                        <div className="progress-bar-shimmer" />
                    </div>
                    <div className="progress-stats">
                        <div className="progress-raised">
                            <span className="sol-amount">{campaign.raised.toFixed(1)} SOL</span>
                            <span className="sol-label">raised</span>
                        </div>
                        <div className="progress-goal">
                            <span className="sol-amount">{campaign.goal} SOL</span>
                            <span className="sol-label">goal</span>
                        </div>
                        <div className={`progress-percent ${isFunded ? 'funded' : ''}`}>
                            <span className="percent-value">{progress.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>

                {/* Representative Info */}
                {campaign.representativeName && (
                    <div className="representative-info">
                        {campaign.representativePhoto && (
                            <Image
                                src={campaign.representativePhoto}
                                alt={campaign.representativeName}
                                width={40}
                                height={40}
                                className="representative-photo"
                            />
                        )}
                        <div className="representative-details">
                            <span className="representative-name">{campaign.representativeName}</span>
                            {campaign.representativeRole && (
                                <span className="representative-role">{campaign.representativeRole}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Row */}
                <div className="card-footer">
                    {/* Location */}
                    <div className="card-location">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="location-icon"
                        >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{campaign.location}</span>
                    </div>

                    {/* Beneficiaries */}
                    {campaign.beneficiaries && (
                        <div className="card-beneficiaries">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="beneficiaries-icon">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>{formatBeneficiaries(campaign.beneficiaries)} beneficiaries</span>
                        </div>
                    )}
                </div>

                {/* Donate CTA */}
                <button
                    className="card-donate-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(true);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    aria-label={`Donate to ${campaign.title}`}
                >
                    <span>Donate Now</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-icon" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </article>
    );
});

export default CampaignCard;

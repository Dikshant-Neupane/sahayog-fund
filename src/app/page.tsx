"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import MissionSection from "./components/MissionSection";
import CampaignCard from "./components/CampaignCard";
import DonateButton from "./components/DonateButton";
import FundraiserForm from "./components/FundraiserForm";
import campaignsData from "./lib/campaigns.json";
import { Toaster, toast } from "react-hot-toast";
import { useLanguage } from "./contexts/LanguageContext";

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
}

// Type assertion for campaigns data
const campaigns: Campaign[] = campaignsData as Campaign[];

export default function Home() {
  const { t } = useLanguage();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isFundraiserFormOpen, setIsFundraiserFormOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Refs for navigation anchoring
  const campaignsSectionRef = useRef<HTMLElement>(null);
  const detailSectionRef = useRef<HTMLElement>(null);

  // Calculate campaign priority score (higher = more priority)
  const getCampaignScore = useCallback((campaign: Campaign) => {
    const progress = (campaign.raised / campaign.goal) * 100;
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (new Date(campaign.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
    );

    let score = 0;

    // Prioritize almost funded campaigns (80-99%)
    if (progress >= 80 && progress < 100) {
      score += 1000;
    }

    // Prioritize urgent campaigns (7 days or less)
    if (daysRemaining > 0 && daysRemaining <= 7) {
      score += 500 + (7 - daysRemaining) * 50;
    }

    // Add funding progress as secondary sort
    score += progress * 3;

    // Bonus for verified campaigns
    if (campaign.verified) {
      score += 100;
    }

    // Deprioritize fully funded and ended campaigns
    if (progress >= 100) {
      score -= 500;
    }
    if (daysRemaining === 0) {
      score -= 1000;
    }

    return score;
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(campaigns.map((c) => c.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  // Filter and sort campaigns by priority
  const filteredCampaigns = useMemo(() => {
    const filtered =
      activeCategory === "All"
        ? campaigns
        : campaigns.filter((c) => c.category === activeCategory);

    // Sort by priority score (highest first)
    return [...filtered].sort((a, b) => getCampaignScore(b) - getCampaignScore(a));
  }, [activeCategory, getCampaignScore]);

  // Calculate campaign progress
  const getProgress = useCallback((raised: number, goal: number) =>
    Math.min((raised / goal) * 100, 100), []);

  // Calculate days remaining
  const getDaysRemaining = useCallback((endDate: string) =>
    Math.max(
      0,
      Math.ceil(
        (new Date(endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
    ), []);

  // Calculate total stats
  const stats = useMemo(() => {
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
    const activeCampaigns = campaigns.filter(c => {
      const daysLeft = Math.ceil(
        (new Date(c.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      );
      return daysLeft > 0;
    }).length;
    const totalDonors = Math.floor(totalRaised * 2.5);
    return { totalRaised, activeCampaigns, totalDonors };
  }, []);

  // Handle logo click - navigate to campaigns grid
  const handleLogoClick = useCallback(() => {
    setSelectedCampaign(null);
    setIsFundraiserFormOpen(false);
    setActiveCategory("All");

    // Scroll to campaigns section with offset for navbar
    setTimeout(() => {
      if (campaignsSectionRef.current) {
        const yOffset = -100; // Navbar height offset
        const y = campaignsSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  // Handle campaign selection - scroll to detail view
  const handleCampaignClick = useCallback((campaign: Campaign, scrollToDonation = false) => {
    setSelectedCampaign(campaign);
    setIsFundraiserFormOpen(false);

    // Scroll to detail section top or donation section
    setTimeout(() => {
      if (scrollToDonation) {
        const donationElement = document.getElementById('donation-section');
        if (donationElement) {
          const headerOffset = 100;
          const elementPosition = donationElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  // Handle back button
  const handleBackClick = useCallback(() => {
    setSelectedCampaign(null);
  }, []);

  // Toggle Fundraiser Form
  const toggleFundraiserForm = () => {
    setIsFundraiserFormOpen(!isFundraiserFormOpen);
    setSelectedCampaign(null);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      <main className="main-container" id="main-content">
        <Toaster position="top-right" />
        <Navbar onLogoClick={handleLogoClick} />

      {isFundraiserFormOpen ? (
        <FundraiserForm onCancel={() => setIsFundraiserFormOpen(false)} />
      ) : (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-background">
              <div className="hero-glow hero-glow-1" />
              <div className="hero-glow hero-glow-2" />
              <div className="hero-glow hero-glow-3" />
            </div>

            <div className="hero-content">
              {/* Hero Logo Mark */}
              <div className="hero-logo-mark">
                <Image
                  src="/logo.png"
                  alt=""
                  width={220}
                  height={220}
                  priority
                  className="hero-logo-img"
                  aria-hidden="true"
                />
              </div>

              <div className="hero-badge">
                <span className="badge-dot" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="hero-title">
                {t.heroTitle1}
                <br />
                <span className="gradient-text">{t.heroTitle2}</span>
              </h1>

              <p className="hero-subtitle">
                {t.heroSubtitle}
              </p>

              <div className="hero-actions">
                <button
                  className="action-btn primary"
                  onClick={() => {
                    handleLogoClick(); // Go to campaigns
                  }}
                >
                  {t.exploreCampaigns}
                </button>
                <button
                  className="action-btn secondary"
                  onClick={toggleFundraiserForm}
                >
                  {t.startFundraiser}
                </button>
              </div>

              {/* Stats */}
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.totalRaised.toFixed(1)}</span>
                  <span className="stat-label">{t.solRaised}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">{stats.activeCampaigns}</span>
                  <span className="stat-label">{t.activeCampaigns}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">{stats.totalDonors}+</span>
                  <span className="stat-label">{t.donors}</span>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="trust-signals">
                <div className="trust-item">
                  <span className="trust-icon">�</span>
                  <span>{t.onChain}</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">⚡</span>
                  <span>{t.fastSettlement}</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">💎</span>
                  <span>{t.trustLowFees}</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>{t.madeForNepal}</span>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          {!selectedCampaign && !isFundraiserFormOpen && (
            <section className="how-it-works-section">
              <div className="how-it-works-header">
                <h2>{t.howItWorksTitle}</h2>
                <p>{t.howItWorksSubtitle}</p>
              </div>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number step-number-1">
                    <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3>{t.step1Title}</h3>
                  <p>{t.step1Desc}</p>
                </div>
                <div className="step-card">
                  <div className="step-number step-number-2">
                    <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3>{t.step2Title}</h3>
                  <p>{t.step2Desc}</p>
                </div>
                <div className="step-card">
                  <div className="step-number step-number-3">
                    <svg className="step-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3>{t.step3Title}</h3>
                  <p>{t.step3Desc}</p>
                </div>
              </div>
            </section>
          )}

          {/* Campaign Section */}
          {!selectedCampaign ? (
            <section className="campaigns-section" ref={campaignsSectionRef}>
              {/* Section Header */}
              <div className="section-header">
                <h2 className="section-title">
                  <span className="title-icon">🌟</span>
                  {t.featuredCampaigns}
                </h2>
                <p className="section-subtitle">
                  {t.discoverCauses}
                </p>
              </div>

              {/* Category Filter */}
              <div className="category-filter" role="tablist" aria-label="Filter campaigns by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filter-btn ${activeCategory === category ? "active" : ""}`}
                    onClick={() => setActiveCategory(category)}
                    role="tab"
                    aria-selected={activeCategory === category}
                    aria-controls="campaign-grid"
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Campaign Grid */}
              <div className="campaign-grid" id="campaign-grid" role="tabpanel" aria-label="Campaign list">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onClick={(scrollToDonation) => handleCampaignClick(campaign, scrollToDonation)}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredCampaigns.length === 0 && (
                <div className="empty-state">
                  <p>No campaigns found in this category.</p>
                  <button
                    className="filter-btn active"
                    onClick={() => setActiveCategory("All")}
                  >
                    View All Campaigns
                  </button>
                </div>
              )}
            </section>
          ) : (
            /* Campaign Detail View */
            <section className="detail-section" ref={detailSectionRef}>
              {/* Back Button */}
              <button 
                className="back-button" 
                onClick={handleBackClick}
                aria-label="Go back to campaign list"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="back-icon"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {t.backToCampaigns}
              </button>

              <div className="detail-container">
                {/* Left Column - Image & Info */}
                <div className="detail-left">
                  <div className="detail-image-container">
                    <Image
                      src={selectedCampaign.image}
                      alt={selectedCampaign.title}
                      fill
                      className="detail-image"
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                    <div className="detail-image-overlay" />
                  </div>

                  <div className="detail-info">
                    <span
                      className={`detail-category category-${selectedCampaign.category.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {selectedCampaign.category}
                    </span>

                    <h1 className="detail-title">{selectedCampaign.title}</h1>

                    <div className="detail-meta">
                      <div className="meta-item">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{selectedCampaign.location}</span>
                      </div>
                      <div className="meta-item">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{getDaysRemaining(selectedCampaign.endDate)} days left</span>
                      </div>
                      <div className="meta-item">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>by {selectedCampaign.organizer}</span>
                      </div>
                    </div>

                    <p className="detail-description">{selectedCampaign.description}</p>

                    {/* Progress */}
                    <div className="detail-progress">
                      <div className="progress-header">
                        <span className="progress-raised-text">
                          <span className="raised-amount">{selectedCampaign.raised}</span> SOL raised
                        </span>
                        <span className="progress-goal-text">
                          of <span className="goal-amount">{selectedCampaign.goal}</span> SOL goal
                        </span>
                      </div>
                      <div className="progress-bar-large">
                        <div
                          className="progress-fill-large"
                          style={{
                            width: `${getProgress(selectedCampaign.raised, selectedCampaign.goal)}%`,
                          }}
                        />
                      </div>
                      <span className="progress-percent-text">
                        {getProgress(selectedCampaign.raised, selectedCampaign.goal).toFixed(0)}% funded
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Donate */}
                <div className="detail-right" id="donation-section">
                  <div className="donate-card">
                    <DonateButton
                      campaignId={selectedCampaign.id}
                      walletAddress={selectedCampaign.walletAddress}
                      campaignTitle={selectedCampaign.title}
                    />

                    {/* Trust Badges */}
                    <div className="trust-badges">
                      <div className="trust-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span>Verified Campaign</span>
                      </div>
                      <div className="trust-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path d="M9 12l2 2 4-4" />
                        </svg>
                        <span>Blockchain Secured</span>
                      </div>
                      <div className="trust-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span>Instant Transfer</span>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="wallet-address-section">
                      <span className="wallet-label">Campaign Wallet</span>
                      <div className="wallet-address">
                        <code>{selectedCampaign.walletAddress.slice(0, 8)}...{selectedCampaign.walletAddress.slice(-8)}</code>
                        <button
                          className="copy-btn"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(selectedCampaign.walletAddress);
                              toast.success('Wallet address copied!', {
                                duration: 2000,
                                icon: '📋',
                                style: {
                                  background: '#0A0E1A',
                                  color: '#fff',
                                  border: '1px solid #22A35D',
                                },
                              });
                            } catch {
                              toast.error('Failed to copy address', {
                                style: {
                                  background: '#0A0E1A',
                                  color: '#fff',
                                  border: '1px solid #DC143C',
                                },
                              });
                            }
                          }}
                          title="Copy address"
                          aria-label="Copy wallet address to clipboard"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}


          {/* Mission Section - Hackathon Criteria */}
          {!selectedCampaign && !isFundraiserFormOpen && (
            <MissionSection />
          )}

          {/* Features Section */}
          {!selectedCampaign && !isFundraiserFormOpen && (
            <section className="features-section">
              <h2 className="features-title">{t.technicalAdvantages}</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon feature-icon-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3>{t.noSignupRequired}</h3>
                  <p>{t.noSignupDesc}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon feature-icon-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <h3>{t.instantTransactions}</h3>
                  <p>{t.instantTransactionsDesc}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon feature-icon-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path d="M12 8v8M8 12h8" />
                    </svg>
                  </div>
                  <h3>{t.fullTransparency}</h3>
                  <p>{t.fullTransparencyDesc}</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon feature-icon-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3>{t.lowFees}</h3>
                  <p>{t.lowFeesDesc}</p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Image src="/logo.png" alt="" width={44} height={44} className="footer-logo-img" aria-hidden="true" />
              <span>SahayogFund</span>
            </div>
            <p>{t.heroSubtitle.split('.')[0]}.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>{t.platform}</h4>
              <a href="#">{t.howItWorks}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsFundraiserFormOpen(true); }}>{t.startFundraiser}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogoClick(); }}>{t.browseCauses}</a>
            </div>
            <div className="footer-column">
              <h4>{t.resources}</h4>
              <a href="#">{t.documentation}</a>
              <a href="#">{t.solanaExplorer}</a>
              <a href="#">{t.getTestSol}</a>
            </div>
            <div className="footer-column">
              <h4>{t.community}</h4>
              <a href="#">Discord</a>
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 SahayogFund. {t.builtWithLove}</p>
          <p className="network-badge">
            <span className="network-dot" />
            {t.connectedToDevnet}
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}

"use client";

import Navbar from '@/app/components/Navbar';
import { DonationForm } from '@/app/components/DonationForm';
import { DonationStats } from '@/app/components/DonationStats';
import { TransactionHistory } from '@/app/components/TransactionHistory';
import Link from 'next/link';

export default function DonatePage() {
    return (
        <main className="main-container">
            <Navbar />

            <section className="donate-page-section">
                <div className="donate-page-container">
                    {/* Header */}
                    <div className="donate-page-header">
                        <Link href="/" className="donate-back-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="back-icon" aria-hidden="true">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back to Campaigns
                        </Link>
                        <h1 className="donate-page-title">
                            Support Sahayog Fund <span className="gradient-text">🌟</span>
                        </h1>
                        <p className="donate-page-subtitle">
                            Every donation makes a difference. Help us empower communities through
                            transparent, blockchain-powered microfinance.
                        </p>
                    </div>

                    {/* Stats Dashboard */}
                    <DonationStats />

                    {/* Donation Form */}
                    <div className="donate-form-wrapper">
                        <DonationForm />
                    </div>

                    {/* Recent Transactions */}
                    <div className="donate-transactions-wrapper">
                        <h2 className="donate-transactions-title">Recent Donations</h2>
                        <TransactionHistory />
                    </div>

                    {/* Transparency Message */}
                    <div className="donate-transparency">
                        <p>
                            All transactions are recorded on Solana blockchain.
                            <a
                                href="https://explorer.solana.com?cluster=devnet"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="donate-explorer-link"
                            >
                                View on Explorer →
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

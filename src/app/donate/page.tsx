"use client";

import { DonationForm } from '@/app/components/DonationForm';
import { DonationStats } from '@/app/components/DonationStats';
import { TransactionHistory } from '@/app/components/TransactionHistory';

export default function DonatePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Support Sahayog Fund 🌟
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Every donation makes a difference. Help us empower communities through
                        transparent, blockchain-powered microfinance.
                    </p>
                </div>

                {/* Stats Dashboard */}
                <DonationStats />

                {/* Donation Form */}
                <div className="mb-12">
                    <DonationForm />
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Donations</h2>
                    <TransactionHistory />
                </div>

                {/* Transparency Message */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        All transactions are recorded on Solana blockchain.
                        <a
                            href="https://explorer.solana.com?cluster=devnet"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline ml-1"
                        >
                            View on Explorer →
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

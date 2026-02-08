import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useDonationProgram } from '@/hooks/useDonationProgram';
import { SOLANA_CONFIG } from '@/config/solana';

interface DonationRecord {
    donor: string;
    amount: number;
    message: string;
    timestamp: number;
}

export function TransactionHistory() {
    const { program } = useDonationProgram();
    const [donations, setDonations] = useState<DonationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDonations() {
            if (!program) {
                setLoading(false);
                return;
            }

            try {
                // NOTE: In the simplified contract we discussed, we might not have `donationRecord` accounts enabled for listing all.
                // If we are using the simple "transfer only" method, we won't have on-chain history without an indexer.
                // Assuming we are building the full one or handling this gracefully.

                // This part assumes the "DonationRecord" account exists in your IDL.
                // If you used the simplified contract I proposed earlier (just 'donate' instruction without creating accounts), this will fail.
                // For robustness, I will wrap this.

                let records: DonationRecord[] = [];

                // @ts-ignore - Dynamic check for IDL capability
                if (program.account?.donationRecord) {
                    // @ts-ignore
                    const accounts = await program.account.donationRecord.all();
                    records = accounts
                        .map((acc: any) => ({
                            donor: acc.account.donor.toString(),
                            amount: acc.account.amount.toNumber() / SOLANA_CONFIG.LAMPORTS_PER_SOL,
                            message: acc.account.message,
                            timestamp: acc.account.timestamp.toNumber(),
                        }))
                        .sort((a: any, b: any) => b.timestamp - a.timestamp)
                        .slice(0, 10); // Show latest 10
                } else {
                    console.log("No donationRecord account found in IDL, skipping history fetch.");
                }

                setDonations(records);
            } catch (error) {
                console.error('Error fetching donations (program may not be initialized or using simplified version):', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDonations();

        // Refresh every 15 seconds
        const interval = setInterval(fetchDonations, 15000);
        return () => clearInterval(interval);
    }, [program]);

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading transactions...</p>
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-4">🎁</p>\n        <p>No donation history available yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {loading ? (
                /* QA: Improved loading state with skeleton UI */
                [1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50 animate-pulse">
                        <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))
            ) : donations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-3 opacity-50">📭</div>
                    <p className="text-gray-500 font-medium">No donations found yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to contribute!</p>
                </div>
            ) : (
                donations.map((donation, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200 group-hover:border-blue-200 transition-colors">
                                        {donation.donor.slice(0, 4)}...{donation.donor.slice(-4)}
                                    </span>
                                    <span className="text-green-600 font-bold flex items-center gap-1">
                                        {donation.amount.toFixed(4)} <span className="text-xs">SOL</span>
                                    </span>
                                </div>
                                {donation.message && (
                                    <p className="text-gray-700 text-sm italic pr-4">"{donation.message}"</p>
                                )}
                            </div>
                            <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                                {new Date(donation.timestamp * 1000).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

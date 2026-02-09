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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mx-auto"></div>
                <p className="mt-4" style={{color: 'rgba(180,198,231,0.5)'}}>Loading transactions...</p>
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="text-center py-8" style={{color: 'rgba(180,198,231,0.5)'}}>
                <p className="text-4xl mb-4">🎁</p>\n        <p>No donation history available yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {loading ? (
                /* QA: Improved loading state with skeleton UI */
                [1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg p-4 animate-pulse" style={{background: 'rgba(21,25,33,0.6)', border: '1px solid rgba(255,255,255,0.06)'}}>
                        <div className="flex justify-between">
                            <div className="h-4 rounded w-1/3 mb-2" style={{background: 'rgba(255,255,255,0.08)'}}></div>
                            <div className="h-4 rounded w-1/6" style={{background: 'rgba(255,255,255,0.08)'}}></div>
                        </div>
                        <div className="h-3 rounded w-1/2" style={{background: 'rgba(255,255,255,0.06)'}}></div>
                    </div>
                ))
            ) : donations.length === 0 ? (
                <div className="text-center py-12 rounded-lg" style={{background: 'rgba(21,25,33,0.4)', border: '2px dashed rgba(255,255,255,0.1)'}}>
                    <div className="text-4xl mb-3 opacity-50">📭</div>
                    <p className="font-medium" style={{color: 'rgba(180,198,231,0.6)'}}>No donations found yet.</p>
                    <p className="text-xs mt-1" style={{color: 'rgba(180,198,231,0.35)'}}>Be the first to contribute!</p>
                </div>
            ) : (
                donations.map((donation, index) => (
                    <div
                        key={index}
                        className="rounded-lg p-4 hover:shadow-md transition-all duration-200 group"
                        style={{background: 'rgba(21,25,33,0.6)', border: '1px solid rgba(255,255,255,0.06)'}}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-xs px-2 py-1 rounded" style={{color: 'rgba(180,198,231,0.6)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}>
                                        {donation.donor.slice(0, 4)}...{donation.donor.slice(-4)}
                                    </span>
                                    <span className="font-bold flex items-center gap-1" style={{color: '#22A35D'}}>
                                        {donation.amount.toFixed(4)} <span className="text-xs">SOL</span>
                                    </span>
                                </div>
                                {donation.message && (
                                    <p className="text-sm italic pr-4" style={{color: 'rgba(180,198,231,0.7)'}}>"{donation.message}"</p>
                                )}
                            </div>
                            <div className="text-right text-xs whitespace-nowrap" style={{color: 'rgba(180,198,231,0.4)'}}>
                                {new Date(donation.timestamp * 1000).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useDonationProgram } from './useDonationProgram';
import { SOLANA_CONFIG } from '@/config/solana';

interface DonationStats {
    totalDonations: number; // in SOL
    totalDonors: number;
    isActive: boolean;
    loading: boolean;
    error: string | null;
}

export function useDonationStats() {
    const { connection } = useConnection();
    const { program, getDonationStatePDA } = useDonationProgram();
    const [stats, setStats] = useState<DonationStats>({
        totalDonations: 0,
        totalDonors: 0,
        isActive: true, // Default to true if contract interaction fails/not deployed
        loading: true,
        error: null,
    });

    const fetchStats = async () => {
        if (!program) {
            setStats(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            const donationStatePDA = getDonationStatePDA();
            // Try to fetch state. If it fails (account doesn't exist yet), return defaults
            const stateAccount = await program.account.donationState.fetch(donationStatePDA);

            setStats({
                totalDonations: stateAccount.totalDonations.toNumber() / SOLANA_CONFIG.LAMPORTS_PER_SOL,
                totalDonors: stateAccount.totalDonors.toNumber(),
                isActive: stateAccount.isActive,
                loading: false,
                error: null,
            });
        } catch (error: any) {
            console.warn('Could not fetch stats (program might not be initialized):', error);
            setStats(prev => ({
                ...prev,
                loading: false,
                // Don't show error to user, just show 0 stats
                error: null,
            }));
        }
    };

    useEffect(() => {
        fetchStats();

        // Poll for updates every 10 seconds
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [program]);

    return { ...stats, refetch: fetchStats };
}

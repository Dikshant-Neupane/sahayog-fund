import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useDonationProgram } from './useDonationProgram';
import { SOLANA_CONFIG } from '@/config/solana';
import toast from 'react-hot-toast';
import { web3 } from '@coral-xyz/anchor';

// QA: Robust Hook for processing donations
export function useDonate() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const { program, getDonationStatePDA, isReady } = useDonationProgram();
    const [loading, setLoading] = useState(false);

    const donate = async (amountSOL: number, message: string = '') => {
        if (!isReady || !publicKey || !program) {
            toast.error('Please connect your wallet first');
            return null;
        }

        if (amountSOL < SOLANA_CONFIG.MIN_DONATION) {
            toast.error(`Minimum donation is ${SOLANA_CONFIG.MIN_DONATION} SOL`);
            return null;
        }

        setLoading(true);
        // QA: Loading states are critical for UX on blockchain apps
        const toastId = toast.loading('Initiating transaction...');

        try {
            // 1. Get fresh blockhash for reliability
            // This prevents "Blockhash not found" errors common on Mainnet/Devnet congestion
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

            // 2. Get PDAs
            const donationStatePDA = getDonationStatePDA();
            const amountLamports = new BN(amountSOL * SOLANA_CONFIG.LAMPORTS_PER_SOL);

            // 3. Build Transaction
            // The anchor .rpc() method is convenient but using .methods().rpc() is standard.
            const tx = await program.methods
                .donate(amountLamports, message)
                .accounts({
                    donationState: donationStatePDA,
                    donor: publicKey,
                    fundWallet: SOLANA_CONFIG.FUND_WALLET,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            toast.loading('Confirming transaction...', { id: toastId });

            // 4. Confirm Transaction (Robust Strategy)
            // Using the latest blockhash strategy ensures we don't wait for expired transactions
            const confirmation = await connection.confirmTransaction({
                signature: tx,
                blockhash,
                lastValidBlockHeight,
            }, 'confirmed');

            if (confirmation.value.err) {
                console.error('Transaction failed:', confirmation.value.err);
                throw new Error('Transaction failed to confirm on-chain.');
            }

            // 5. Celebration!
            toast.success(
                <div>
                <p className="font-bold" > Donation Successful! 🎉</p>
            < a 
                        href = {`https://explorer.solana.com/tx/${tx}?cluster=devnet`} 
                        target = "_blank"
        rel = "noopener noreferrer"
        className = "text-indigo-500 hover:text-indigo-700 underline text-sm"
            >
            View on Explorer
                </a>
                </div>,
        { id: toastId, duration: 8000 }
            );

    return tx;
} catch (error: any) {
    console.error('Donation error:', error);

    let errorMessage = 'Donation failed. Please try again.';

    // QA: Handle specific Solana errors for better user feedback
    const errStr = error?.message || JSON.stringify(error);
    if (errStr.includes('User rejected') || errStr.includes('0x0')) {
        errorMessage = 'Transaction requests declined by user.';
    } else if (errStr.includes('0x1')) {
        errorMessage = 'Insufficient funds for transaction.';
    } else if (errStr.includes('Attempt to debit an account but found no record of a prior credit')) {
        errorMessage = 'Wallet has no SOL. Please get Devnet SOL.';
    }

    toast.error(errorMessage, { id: toastId });
    return null;
} finally {
    setLoading(false);
}
    };

return { donate, loading, isReady };
}

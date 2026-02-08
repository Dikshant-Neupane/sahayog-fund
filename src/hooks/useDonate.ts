import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@coral-xyz/anchor';
import { useDonationProgram } from './useDonationProgram';
import { SOLANA_CONFIG } from '@/config/solana';
import toast from 'react-hot-toast';
import { web3 } from '@coral-xyz/anchor';

// Transaction phase for granular UI feedback
export type TxPhase = 'idle' | 'validating' | 'preparing' | 'building' | 'signing' | 'confirming' | 'done';

export function useDonate() {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const { program, getDonationStatePDA, isReady } = useDonationProgram();
    const [loading, setLoading] = useState(false);
    const [txPhase, setTxPhase] = useState<TxPhase>('idle');

    const donate = useCallback(async (amountSOL: number, message: string = '') => {
        if (!isReady || !publicKey || !program) {
            toast.error('Please connect your wallet first');
            return null;
        }

        // Client-side validation
        if (amountSOL < SOLANA_CONFIG.MIN_DONATION) {
            toast.error(`Minimum donation is ${SOLANA_CONFIG.MIN_DONATION} SOL`);
            return null;
        }

        if (amountSOL > SOLANA_CONFIG.MAX_DONATION) {
            toast.error(`Maximum donation is ${SOLANA_CONFIG.MAX_DONATION} SOL`);
            return null;
        }

        if (message.length > 280) {
            toast.error('Message must be 280 characters or less');
            return null;
        }

        setLoading(true);
        setTxPhase('validating');
        const toastId = toast.loading('Validating...');

        try {
            // 1. Check wallet balance before attempting tx
            setTxPhase('preparing');
            toast.loading('Checking balance...', { id: toastId });

            const balance = await connection.getBalance(publicKey);
            const requiredLamports = amountSOL * SOLANA_CONFIG.LAMPORTS_PER_SOL;
            const estimatedFee = 10000; // ~0.00001 SOL tx fee buffer

            if (balance < requiredLamports + estimatedFee) {
                const balanceSOL = (balance / SOLANA_CONFIG.LAMPORTS_PER_SOL).toFixed(4);
                toast.error(`Insufficient balance: ${balanceSOL} SOL. Need ${amountSOL} SOL + fees.`, { id: toastId });
                return null;
            }

            // 2. Get fresh blockhash
            toast.loading('Preparing transaction...', { id: toastId });
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

            // 3. Build transaction
            setTxPhase('building');
            toast.loading('Building transaction...', { id: toastId });

            const donationStatePDA = getDonationStatePDA();
            const amountLamports = new BN(Math.floor(amountSOL * SOLANA_CONFIG.LAMPORTS_PER_SOL));

            // 4. Send transaction
            setTxPhase('signing');
            toast.loading('Please approve in wallet...', { id: toastId });

            const tx = await program.methods
                .donate(amountLamports, message)
                .accounts({
                    donationState: donationStatePDA,
                    donor: publicKey,
                    fundWallet: SOLANA_CONFIG.FUND_WALLET,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            // 5. Confirm
            setTxPhase('confirming');
            toast.loading('Confirming on-chain...', { id: toastId });

            const confirmation = await connection.confirmTransaction({
                signature: tx,
                blockhash,
                lastValidBlockHeight,
            }, 'confirmed');

            if (confirmation.value.err) {
                console.error('Transaction failed:', confirmation.value.err);
                throw new Error('Transaction failed to confirm on-chain.');
            }

            // 6. Success
            setTxPhase('done');
            toast.success(
                `Donation of ${amountSOL} SOL successful! 🎉 View on Explorer →`,
                { id: toastId, duration: 8000 }
            );

            return tx;
        } catch (error: any) {
            console.error('Donation error:', error);

            let errorMessage = 'Donation failed. Please try again.';
            const errStr = error?.message || JSON.stringify(error);

            // Map specific errors to user-friendly messages
            if (errStr.includes('User rejected') || errStr.includes('rejected')) {
                errorMessage = 'Transaction cancelled by user.';
            } else if (errStr.includes('0x1') || errStr.includes('insufficient')) {
                errorMessage = 'Insufficient funds for this transaction.';
            } else if (errStr.includes('Attempt to debit an account but found no record')) {
                errorMessage = 'Wallet has no SOL. Get Devnet SOL from a faucet.';
            } else if (errStr.includes('Blockhash not found') || errStr.includes('block height exceeded')) {
                errorMessage = 'Transaction expired. Please try again.';
            } else if (errStr.includes('429') || errStr.includes('rate')) {
                errorMessage = 'Rate limited. Please wait a moment and retry.';
            } else if (errStr.includes('Network') || errStr.includes('fetch')) {
                errorMessage = 'Network error. Check your connection.';
            } else if (errStr.includes('CampaignInactive') || errStr.includes('6001')) {
                errorMessage = 'This campaign is no longer active.';
            } else if (errStr.includes('CampaignExpired') || errStr.includes('6002')) {
                errorMessage = 'This campaign has expired.';
            } else if (errStr.includes('DonationTooSmall') || errStr.includes('6003')) {
                errorMessage = `Minimum donation is ${SOLANA_CONFIG.MIN_DONATION} SOL.`;
            } else if (errStr.includes('DonationTooLarge') || errStr.includes('6004')) {
                errorMessage = `Maximum donation is ${SOLANA_CONFIG.MAX_DONATION} SOL.`;
            } else if (errStr.includes('MessageTooLong') || errStr.includes('6005')) {
                errorMessage = 'Message is too long (max 280 characters).';
            }

            toast.error(errorMessage, { id: toastId });
            return null;
        } finally {
            setLoading(false);
            setTxPhase('idle');
        }
    }, [isReady, publicKey, program, connection, getDonationStatePDA]);

    return { donate, loading, txPhase, isReady };
}

import { PublicKey, clusterApiUrl } from '@solana/web3.js';

export const SOLANA_CONFIG = {
  
    PROGRAM_ID: new PublicKey('Buv5zyTkgj1pDDLKrt9q6Yy39vndTfFumEk7cLdwzmsA'),

    // Treasury wallet address
    FUND_WALLET: new PublicKey('8HACvxLFboKua6ARScPZsqHVCMAQ7MniL8AhNDxomV9Y'),

    // Network configuration
    NETWORK: 'devnet' as const,
    RPC_ENDPOINT: clusterApiUrl('devnet'),

    // Program derived addresses seeds
    SEEDS: {
        DONATION_STATE: 'donation_state',
        DONATION: 'donation',
    },

    // Constants
    MIN_DONATION: 0.0001, // SOL
    LAMPORTS_PER_SOL: 1_000_000_000,
};

// QA Check: Warn developer if using default program ID
if (typeof window !== 'undefined' && SOLANA_CONFIG.PROGRAM_ID.toString() === '11111111111111111111111111111111') {
    console.warn('%c⚠️ QA WARNING: Program ID is default. Smart contract calls will fail. Update src/config/solana.ts', 'background: #ff0000; color: #ffffff; padding: 4px; font-weight: bold;');
}

export const getExplorerUrl = (signature: string, cluster = 'devnet') => {
    return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

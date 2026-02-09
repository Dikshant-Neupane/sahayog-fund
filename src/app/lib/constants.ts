// Re-export from central Solana config to maintain single source of truth
import { SOLANA_CONFIG, getExplorerUrl } from '@/config/solana';

export const TREASURY_WALLET = SOLANA_CONFIG.FUND_WALLET.toString();
export const LAMPORTS_PER_SOL = SOLANA_CONFIG.LAMPORTS_PER_SOL;
export const SOLANA_EXPLORER_URL = "https://explorer.solana.com";
export const NETWORK = SOLANA_CONFIG.NETWORK;
export { getExplorerUrl };

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { SOLANA_CONFIG } from '@/config/solana';

// We'll use a generic IDL type initially until you build the contract
const IDL: Idl = {
    "version": "0.1.0",
    "name": "sahayog_donation",
    "instructions": [
        {
            "name": "donate",
            "accounts": [
                { "name": "donationState", "isMut": true, "isSigner": false },
                { "name": "donationRecord", "isMut": true, "isSigner": false },
                { "name": "donor", "isMut": true, "isSigner": true },
                { "name": "fundWallet", "isMut": true, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "amount", "type": "u64" },
                { "name": "message", "type": "string" }
            ]
        }
    ]
};

export function useDonationProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const provider = useMemo(() => {
        if (!wallet.publicKey) return null;
        return new AnchorProvider(
            connection,
            wallet as any,
            { commitment: 'confirmed' }
        );
    }, [connection, wallet]);

    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(
            IDL,
            SOLANA_CONFIG.PROGRAM_ID,
            provider
        );
    }, [provider]);

    const getDonationStatePDA = () => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from(SOLANA_CONFIG.SEEDS.DONATION_STATE)],
            SOLANA_CONFIG.PROGRAM_ID
        );
        return pda;
    };

    return {
        program,
        provider,
        getDonationStatePDA,
        isReady: !!program && !!wallet.publicKey,
    };
}

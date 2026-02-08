import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { SOLANA_CONFIG } from '@/config/solana';

// Updated IDL matching the secure contract with all instructions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IDL: any = {
    "version": "0.1.0",
    "name": "sahayog_donation",
    "metadata": {
        "address": "Buv5zyTkgj1pDDLKrt9q6Yy39vndTfFumEk7cLdwzmsA"
    },
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                { "name": "donationState", "isMut": true, "isSigner": false },
                { "name": "authority", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "fundWallet", "type": "publicKey" },
                { "name": "deadline", "type": "i64" }
            ]
        },
        {
            "name": "donate",
            "accounts": [
                { "name": "donationState", "isMut": true, "isSigner": false },
                { "name": "donor", "isMut": true, "isSigner": true },
                { "name": "fundWallet", "isMut": true, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "amount", "type": "u64" },
                { "name": "message", "type": "string" }
            ]
        },
        {
            "name": "withdraw",
            "accounts": [
                { "name": "donationState", "isMut": true, "isSigner": false },
                { "name": "authority", "isMut": true, "isSigner": true },
                { "name": "fundWallet", "isMut": true, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "amount", "type": "u64" }
            ]
        },
        {
            "name": "refund",
            "accounts": [
                { "name": "donationState", "isMut": true, "isSigner": false },
                { "name": "authority", "isMut": true, "isSigner": true },
                { "name": "fundWallet", "isMut": true, "isSigner": false },
                { "name": "donor", "isMut": true, "isSigner": false },
                { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "amount", "type": "u64" }
            ]
        },
        {
            "name": "toggleActive",
            "accounts": [
                { "name": "donationState", "isMut": true, "isSigner": false },
                { "name": "authority", "isMut": false, "isSigner": true }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "DonationState",
            "type": {
                "kind": "struct",
                "fields": [
                    { "name": "authority", "type": "publicKey" },
                    { "name": "fundWallet", "type": "publicKey" },
                    { "name": "totalDonated", "type": "u64" },
                    { "name": "totalWithdrawn", "type": "u64" },
                    { "name": "donorCount", "type": "u64" },
                    { "name": "isActive", "type": "bool" },
                    { "name": "deadline", "type": "i64" },
                    { "name": "bump", "type": "u8" }
                ]
            }
        }
    ],
    "errors": [
        { "code": 6000, "name": "Unauthorized", "msg": "Unauthorized: Only the campaign authority can perform this action" },
        { "code": 6001, "name": "CampaignInactive", "msg": "Campaign is not active" },
        { "code": 6002, "name": "CampaignExpired", "msg": "Campaign has expired" },
        { "code": 6003, "name": "DonationTooSmall", "msg": "Donation amount is below minimum (0.0001 SOL)" },
        { "code": 6004, "name": "DonationTooLarge", "msg": "Donation amount exceeds maximum (500 SOL)" },
        { "code": 6005, "name": "MessageTooLong", "msg": "Message exceeds maximum length (280 characters)" },
        { "code": 6006, "name": "DeadlineInPast", "msg": "Deadline must be in the future" },
        { "code": 6007, "name": "CampaignTooLong", "msg": "Campaign duration exceeds maximum (180 days)" },
        { "code": 6008, "name": "WithdrawalBeforeDeadline", "msg": "Withdrawal not allowed before campaign deadline" },
        { "code": 6009, "name": "InsufficientFunds", "msg": "Insufficient funds for withdrawal" },
        { "code": 6010, "name": "ZeroAmount", "msg": "Amount must be greater than zero" },
        { "code": 6011, "name": "InvalidFundWallet", "msg": "Invalid fund wallet address" }
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
            IDL as Idl,
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

"use client";

import { useState, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    Transaction,
    SystemProgram,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import toast from "react-hot-toast";

interface DonateButtonProps {
    campaignId: string;
    walletAddress: string;
    campaignTitle: string;
}

const DonateButton = ({
    campaignId,
    walletAddress,
    campaignTitle,
}: DonateButtonProps) => {
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    // Quick amount buttons
    const quickAmounts = [0.1, 0.5, 1, 2];

    const handleDonate = useCallback(async () => {
        // Step 1: Check if wallet is connected
        if (!publicKey) {
            toast.error("Please connect your wallet first!", {
                icon: "🔗",
                style: {
                    background: "#0A0E1A",
                    color: "#fff",
                    border: "1px solid #DC143C",
                },
            });
            return;
        }

        // Step 2: Validate amount
        const donationAmount = parseFloat(amount);
        if (!amount || donationAmount <= 0 || isNaN(donationAmount)) {
            toast.error("Please enter a valid amount", {
                icon: "⚠️",
                style: {
                    background: "#0A0E1A",
                    color: "#fff",
                    border: "1px solid #DC143C",
                },
            });
            return;
        }

        // Step 3: Set loading state
        setIsLoading(true);
        const loadingToast = toast.loading("Processing your donation...", {
            style: {
                background: "#0A0E1A",
                color: "#fff",
                border: "1px solid #003893",
            },
        });

        try {
            // Step 4: Create the transaction
            const transaction = new Transaction();

            // Step 5: Add transfer instruction
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(walletAddress),
                    lamports: Math.floor(donationAmount * LAMPORTS_PER_SOL),
                })
            );

            // Step 6: Send the transaction
            const signature = await sendTransaction(transaction, connection);

            // Step 7: Wait for confirmation
            const confirmation = await connection.confirmTransaction(
                signature,
                "confirmed"
            );

            if (confirmation.value.err) {
                throw new Error("Transaction failed to confirm");
            }

            // Step 8: Show success message with rhododendron flourish
            toast.dismiss(loadingToast);
            toast.success(
                <div className="toast-success-content">
                    <p>
                        <strong>🌺 Donation successful!</strong>
                    </p>
                    <p>You donated {donationAmount} SOL to {campaignTitle}</p>
                    <a
                        href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="toast-link"
                    >
                        View on Explorer →
                    </a>
                </div>,
                {
                    duration: 6000,
                    icon: "🇳🇵",
                    style: {
                        background: "#0A0E1A",
                        color: "#fff",
                        border: "1px solid #22A35D",
                    },
                }
            );

            // Clear the amount
            setAmount("");
        } catch (error: unknown) {
            // Step 8 (error): Show error message
            toast.dismiss(loadingToast);
            const errorMessage =
                error instanceof Error ? error.message : "Transaction failed";
            toast.error(errorMessage, {
                icon: "❌",
                style: {
                    background: "#0A0E1A",
                    color: "#fff",
                    border: "1px solid #DC143C",
                },
            });
        } finally {
            setIsLoading(false);
        }
    }, [
        publicKey,
        amount,
        walletAddress,
        campaignTitle,
        connection,
        sendTransaction,
    ]);

    return (
        <div className="donate-section">
            <h4 className="donate-title">Make a Donation</h4>

            {/* Quick Amount Buttons */}
            <div className="quick-amounts">
                {quickAmounts.map((quickAmount) => (
                    <button
                        key={quickAmount}
                        type="button"
                        className={`quick-amount-btn ${amount === quickAmount.toString() ? "active" : ""
                            }`}
                        onClick={() => setAmount(quickAmount.toString())}
                        disabled={isLoading}
                    >
                        {quickAmount} SOL
                    </button>
                ))}
            </div>

            {/* Amount Input */}
            <div className="amount-input-container">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in SOL"
                    className="amount-input"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                />
                <span className="sol-suffix">SOL</span>
            </div>

            {/* Donate Button */}
            <button
                type="button"
                onClick={handleDonate}
                disabled={isLoading || !amount}
                className={`donate-button ${isLoading ? "loading" : ""}`}
            >
                {isLoading ? (
                    <span className="loading-content">
                        <svg className="spinner" viewBox="0 0 24 24">
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="60"
                                strokeDashoffset="45"
                            />
                        </svg>
                        Processing...
                    </span>
                ) : (
                    <span className="donate-content">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="heart-icon"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        Donate {amount ? `${amount} SOL` : "Now"}
                    </span>
                )}
            </button>

            {/* Wallet Status */}
            {!publicKey && (
                <p className="wallet-hint">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="info-icon"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Connect your wallet to donate
                </p>
            )}
        </div>
    );
};

export default DonateButton;

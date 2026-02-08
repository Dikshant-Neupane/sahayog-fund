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
import confetti from "canvas-confetti";

interface DonateButtonProps {
    campaignId: string;
    walletAddress: string;
    campaignTitle: string;
}

// Validation constants
const MIN_DONATION_SOL = 0.001;
const MAX_DONATION_SOL = 500;

const DonateButton = ({
    campaignId,
    walletAddress,
    campaignTitle,
}: DonateButtonProps) => {
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [txPhase, setTxPhase] = useState<string>("");

    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();

    // Quick amount buttons
    const quickAmounts = [0.1, 0.5, 1, 2];

    const fireConfetti = () => {
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({
                startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#DC143C', '#003893', '#FFFFFF', '#22A35D', '#F7B32B']
            });
            confetti({
                startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#DC143C', '#003893', '#FFFFFF', '#22A35D', '#F7B32B']
            });
        }, 250);
    };

    const handleDonate = useCallback(async () => {
        // Step 1: Check if wallet is connected
        if (!publicKey || !connected) {
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

        // Step 3: Validate min/max bounds
        if (donationAmount < MIN_DONATION_SOL) {
            toast.error(`Minimum donation is ${MIN_DONATION_SOL} SOL`, {
                icon: "💰",
                style: {
                    background: "#0A0E1A",
                    color: "#fff",
                    border: "1px solid #DC143C",
                },
            });
            return;
        }

        if (donationAmount > MAX_DONATION_SOL) {
            toast.error(`Maximum donation is ${MAX_DONATION_SOL} SOL per transaction`, {
                icon: "🐋",
                style: {
                    background: "#0A0E1A",
                    color: "#fff",
                    border: "1px solid #DC143C",
                },
            });
            return;
        }

        // Step 4: Set loading state
        setIsLoading(true);
        setTxPhase("preparing");
        const loadingToast = toast.loading("Preparing transaction...", {
            style: {
                background: "#0A0E1A",
                color: "#fff",
                border: "1px solid #003893",
            },
        });

        try {
            // Step 5: Check wallet balance
            setTxPhase("checking");
            const balance = await connection.getBalance(publicKey);
            const requiredLamports = Math.floor(donationAmount * LAMPORTS_PER_SOL) + 5000; // 5000 for tx fee
            if (balance < requiredLamports) {
                toast.dismiss(loadingToast);
                toast.error(
                    `Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL but need ~${(requiredLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
                    {
                        icon: "💸",
                        duration: 5000,
                        style: {
                            background: "#0A0E1A",
                            color: "#fff",
                            border: "1px solid #DC143C",
                        },
                    }
                );
                return;
            }

            // Step 6: Create the transaction
            setTxPhase("building");
            toast.loading("Building transaction...", { id: loadingToast });

            const transaction = new Transaction();
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(walletAddress),
                    lamports: Math.floor(donationAmount * LAMPORTS_PER_SOL),
                })
            );

            // Step 7: Send the transaction
            setTxPhase("signing");
            toast.loading("Please approve in your wallet...", { id: loadingToast });

            const signature = await sendTransaction(transaction, connection);

            // Step 8: Wait for confirmation
            setTxPhase("confirming");
            toast.loading("Confirming on Solana...", { id: loadingToast });

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            const confirmation = await connection.confirmTransaction(
                { signature, blockhash, lastValidBlockHeight },
                "confirmed"
            );

            if (confirmation.value.err) {
                throw new Error("Transaction failed to confirm on-chain");
            }

            // Step 9: Show success with confetti
            toast.dismiss(loadingToast);
            fireConfetti();
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

            setAmount("");
        } catch (error: unknown) {
            toast.dismiss(loadingToast);

            // Detailed error handling
            const errStr = error instanceof Error ? error.message : String(error);

            let errorMessage = "Transaction failed. Please try again.";
            let errorIcon = "❌";

            if (errStr.includes("User rejected") || errStr.includes("rejected")) {
                errorMessage = "Transaction cancelled by user";
                errorIcon = "🚫";
            } else if (errStr.includes("0x1") || errStr.includes("insufficient")) {
                errorMessage = "Insufficient funds for this transaction";
                errorIcon = "💸";
            } else if (errStr.includes("blockhash") || errStr.includes("block height")) {
                errorMessage = "Transaction expired. Please try again.";
                errorIcon = "⏱️";
            } else if (errStr.includes("Network") || errStr.includes("fetch") || errStr.includes("ECONNREFUSED")) {
                errorMessage = "Network error. Check your connection and try again.";
                errorIcon = "📡";
            } else if (errStr.includes("rate") || errStr.includes("429")) {
                errorMessage = "Too many requests. Please wait a moment.";
                errorIcon = "⏳";
            } else if (errStr.includes("AccountNotFound") || errStr.includes("no record")) {
                errorMessage = "Wallet has no SOL. Get Devnet SOL from faucet.solana.com";
                errorIcon = "🪙";
            }

            toast.error(errorMessage, {
                icon: errorIcon,
                duration: 5000,
                style: {
                    background: "#0A0E1A",
                    color: "#fff",
                    border: "1px solid #DC143C",
                },
            });
        } finally {
            setIsLoading(false);
            setTxPhase("");
        }
    }, [
        publicKey,
        connected,
        amount,
        walletAddress,
        campaignTitle,
        connection,
        sendTransaction,
    ]);

    // Get loading phase text
    const getLoadingText = () => {
        switch (txPhase) {
            case "checking": return "Checking balance...";
            case "building": return "Building transaction...";
            case "signing": return "Approve in wallet...";
            case "confirming": return "Confirming on-chain...";
            default: return "Processing...";
        }
    };

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
                        aria-label={`Set donation amount to ${quickAmount} SOL`}
                    >
                        {quickAmount} SOL
                    </button>
                ))}
            </div>

            {/* Amount Input with validation hints */}
            <div className="amount-input-container">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min ${MIN_DONATION_SOL} — Max ${MAX_DONATION_SOL} SOL`}
                    className="amount-input"
                    min={MIN_DONATION_SOL}
                    max={MAX_DONATION_SOL}
                    step="0.01"
                    disabled={isLoading}
                    aria-label="Donation amount in SOL"
                />
                <span className="sol-suffix">SOL</span>
            </div>

            {/* Validation hint */}
            {amount && parseFloat(amount) > 0 && parseFloat(amount) < MIN_DONATION_SOL && (
                <p className="donation-hint error">Minimum donation: {MIN_DONATION_SOL} SOL</p>
            )}
            {amount && parseFloat(amount) > MAX_DONATION_SOL && (
                <p className="donation-hint error">Maximum donation: {MAX_DONATION_SOL} SOL per transaction</p>
            )}

            {/* Donate Button with loading states */}
            <button
                type="button"
                onClick={handleDonate}
                disabled={isLoading || !amount || !connected || parseFloat(amount) < MIN_DONATION_SOL || parseFloat(amount) > MAX_DONATION_SOL}
                className={`donate-button ${isLoading ? "loading" : ""}`}
                aria-busy={isLoading}
                aria-disabled={isLoading || !amount || !connected}
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
                        {getLoadingText()}
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

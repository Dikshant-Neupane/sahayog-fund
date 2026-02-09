"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    Transaction,
    SystemProgram,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
    walletAddress: string;
    campaignTitle: string;
    campaignOrganizer: string;
}

const QUICK_AMOUNTS = [0.01, 0.05, 0.1, 0.5, 1, 2];
const MIN_DONATION = 0.001;
const MAX_DONATION = 500;

const DonationModal = ({
    isOpen,
    onClose,
    campaignId,
    walletAddress,
    campaignTitle,
    campaignOrganizer,
}: DonationModalProps) => {
    const [amount, setAmount] = useState("");
    const [donorName, setDonorName] = useState("");
    const [message, setMessage] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [step, setStep] = useState(1); // 1: amount, 2: info, 3: confirm
    const [isLoading, setIsLoading] = useState(false);
    const [txPhase, setTxPhase] = useState("");
    const [txSignature, setTxSignature] = useState("");
    const modalRef = useRef<HTMLDivElement>(null);

    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isLoading) onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [isOpen, isLoading, onClose]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setAmount("");
            setDonorName("");
            setMessage("");
            setAnonymous(false);
            setTxSignature("");
            setTxPhase("");
        }
    }, [isOpen]);

    const fireConfetti = () => {
        const duration = 2000;
        const end = Date.now() + duration;
        const interval = setInterval(() => {
            if (Date.now() > end) return clearInterval(interval);
            confetti({
                startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999,
                particleCount: 40,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: ['#DC143C', '#003893', '#FFFFFF', '#22A35D', '#F7B32B']
            });
        }, 250);
    };

    const handleDonate = useCallback(async () => {
        if (!publicKey || !connected) {
            toast.error("Please connect your wallet first!");
            return;
        }

        const donationAmount = parseFloat(amount);
        if (!donationAmount || donationAmount < MIN_DONATION || donationAmount > MAX_DONATION) {
            toast.error("Invalid donation amount");
            return;
        }

        setIsLoading(true);
        setTxPhase("checking");

        try {
            // Check balance
            const balance = await connection.getBalance(publicKey);
            const needed = Math.floor(donationAmount * LAMPORTS_PER_SOL) + 5000;
            if (balance < needed) {
                toast.error(`Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
                return;
            }

            // Build transaction
            setTxPhase("building");
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(walletAddress),
                    lamports: Math.floor(donationAmount * LAMPORTS_PER_SOL),
                })
            );

            // Sign
            setTxPhase("signing");
            const signature = await sendTransaction(tx, connection);

            // Confirm
            setTxPhase("confirming");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
            const confirmation = await connection.confirmTransaction(
                { signature, blockhash, lastValidBlockHeight },
                "confirmed"
            );

            if (confirmation.value.err) {
                throw new Error("Transaction failed on-chain");
            }

            // Record donation via API
            try {
                await fetch('/api/submit-donation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        campaign_id: campaignId,
                        donor_wallet: publicKey.toString(),
                        amount: donationAmount,
                        tx_signature: signature,
                        anonymous,
                        donor_name: anonymous ? null : donorName || null,
                        message: message || null,
                    }),
                });
            } catch {
                // Non-critical - donation still went through on-chain
                console.warn("Failed to record donation in database");
            }

            setTxSignature(signature);
            setStep(4); // Success step
            fireConfetti();

        } catch (error: unknown) {
            const errStr = error instanceof Error ? error.message : String(error);
            if (errStr.includes("rejected") || errStr.includes("User rejected")) {
                toast.error("Transaction cancelled");
            } else if (errStr.includes("insufficient")) {
                toast.error("Insufficient funds");
            } else {
                toast.error("Transaction failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
            setTxPhase("");
        }
    }, [publicKey, connected, amount, walletAddress, campaignId, anonymous, donorName, message, connection, sendTransaction]);

    const getPhaseText = () => {
        switch (txPhase) {
            case "checking": return "Checking balance...";
            case "building": return "Building transaction...";
            case "signing": return "Approve in your wallet...";
            case "confirming": return "Confirming on Solana...";
            default: return "Processing...";
        }
    };

    if (!isOpen) return null;

    const donationAmount = parseFloat(amount) || 0;
    const isValidAmount = donationAmount >= MIN_DONATION && donationAmount <= MAX_DONATION;

    return (
        <div className="donation-modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) onClose();
        }}>
            <div className="donation-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label="Donate to campaign">
                <button className="donation-modal-close" onClick={onClose} disabled={isLoading} aria-label="Close donation modal">×</button>

                {/* Step 1: Amount */}
                {step === 1 && (
                    <>
                        <h2>💝 Donate</h2>
                        <p className="modal-subtitle">to {campaignTitle}</p>

                        <div className="quick-amounts">
                            {QUICK_AMOUNTS.map(qa => (
                                <button
                                    key={qa}
                                    className={`quick-amount-btn ${amount === qa.toString() ? 'selected' : ''}`}
                                    onClick={() => setAmount(qa.toString())}
                                >
                                    {qa} SOL
                                </button>
                            ))}
                        </div>

                        <div className="form-group">
                            <label>Custom Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`${MIN_DONATION} - ${MAX_DONATION} SOL`}
                                min={MIN_DONATION}
                                max={MAX_DONATION}
                                step="0.01"
                            />
                        </div>

                        <button
                            className="btn-donate-modal"
                            disabled={!isValidAmount || !connected}
                            onClick={() => setStep(2)}
                        >
                            {!connected ? "Connect Wallet First" : isValidAmount ? `Continue with ${donationAmount} SOL` : "Enter Amount"}
                        </button>
                    </>
                )}

                {/* Step 2: Donor Info */}
                {step === 2 && (
                    <>
                        <h2>👤 Your Info</h2>
                        <p className="modal-subtitle">Optional — leave blank to stay anonymous</p>

                        <div className="form-group">
                            <label>Your Name</label>
                            <input
                                type="text"
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="Enter your name (optional)"
                                disabled={anonymous}
                            />
                        </div>

                        <div className="form-group">
                            <label>Message to Campaign</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Your encouragement or words of support..."
                                rows={3}
                            />
                        </div>

                        <label className="anonymous-toggle">
                            <input
                                type="checkbox"
                                checked={anonymous}
                                onChange={(e) => {
                                    setAnonymous(e.target.checked);
                                    if (e.target.checked) setDonorName("");
                                }}
                            />
                            <span>Donate anonymously</span>
                        </label>

                        <div className="form-navigation">
                            <button className="btn-prev" onClick={() => setStep(1)}>← Back</button>
                            <button className="btn-next" onClick={() => setStep(3)}>Review →</button>
                        </div>
                    </>
                )}

                {/* Step 3: Review & Confirm */}
                {step === 3 && (
                    <>
                        <h2>📋 Review Donation</h2>
                        <p className="modal-subtitle">Confirm your donation details</p>

                        <div className="donation-summary">
                            <div className="donation-summary-row">
                                <span>Campaign</span>
                                <span>{campaignTitle}</span>
                            </div>
                            <div className="donation-summary-row">
                                <span>Organizer</span>
                                <span>{campaignOrganizer}</span>
                            </div>
                            <div className="donation-summary-row">
                                <span>Donor</span>
                                <span>{anonymous ? "Anonymous" : donorName || "Anonymous"}</span>
                            </div>
                            {message && (
                                <div className="donation-summary-row">
                                    <span>Message</span>
                                    <span style={{ maxWidth: '200px', textAlign: 'right' }}>{message.substring(0, 80)}</span>
                                </div>
                            )}
                            <div className="donation-summary-row total">
                                <span>Amount</span>
                                <span>{donationAmount} SOL</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <div className="spinner-container">
                                    <svg className="spinner" viewBox="0 0 24 24" style={{ width: 32, height: 32, margin: '0 auto' }}>
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="45" />
                                    </svg>
                                </div>
                                <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{getPhaseText()}</p>
                            </div>
                        ) : (
                            <div className="form-navigation">
                                <button className="btn-prev" onClick={() => setStep(2)}>← Back</button>
                                <button className="btn-donate-modal" onClick={handleDonate} style={{ flex: 1 }}>
                                    🌺 Confirm & Donate {donationAmount} SOL
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="confirmation-card">
                        <div className="confirmation-icon">🌺</div>
                        <h3>Donation Successful!</h3>
                        <p>Thank you for supporting {campaignTitle}. Your generosity makes a difference. 🇳🇵</p>

                        <div className="donation-summary" style={{ textAlign: 'left' }}>
                            <div className="donation-summary-row">
                                <span>Amount</span>
                                <span>{donationAmount} SOL</span>
                            </div>
                            <div className="donation-summary-row">
                                <span>Status</span>
                                <span style={{ color: 'var(--success-green)' }}>✅ Confirmed</span>
                            </div>
                        </div>

                        {txSignature && (
                            <a
                                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-donate-modal"
                                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: '0.75rem' }}
                            >
                                View on Solana Explorer →
                            </a>
                        )}

                        <button className="btn-prev" onClick={onClose} style={{ width: '100%' }}>
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationModal;

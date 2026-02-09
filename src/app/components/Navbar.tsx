"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// Dynamically import wallet button to prevent SSR issues
const WalletMultiButton = dynamic(
    async () =>
        (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

interface NavbarProps {
    onLogoClick?: () => void;
}

const Navbar = ({ onLogoClick }: NavbarProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [balance, setBalance] = useState<number | null>(null);
    const { publicKey, connected, disconnect } = useWallet();
    const { connection } = useConnection();

    // Fetch wallet balance when connected
    useEffect(() => {
        if (!publicKey || !connected) {
            setBalance(null);
            return;
        }
        let cancelled = false;
        const fetchBalance = async () => {
            try {
                const bal = await connection.getBalance(publicKey);
                if (!cancelled) setBalance(bal / LAMPORTS_PER_SOL);
            } catch {
                if (!cancelled) setBalance(null);
            }
        };
        fetchBalance();
        const interval = setInterval(fetchBalance, 15000);
        return () => { cancelled = true; clearInterval(interval); };
    }, [publicKey, connected, connection]);

    const handleLogoClick = () => {
        if (onLogoClick) onLogoClick();
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
    }, []);

    // Close mobile menu on escape or resize
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileMenuOpen(false); };
        const handleResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false); };
        document.addEventListener("keydown", handleEsc);
        window.addEventListener("resize", handleResize);
        return () => { document.removeEventListener("keydown", handleEsc); window.removeEventListener("resize", handleResize); };
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileMenuOpen]);

    const truncateAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

    const [hasWalletExtension, setHasWalletExtension] = useState(false);

    useEffect(() => {
        setHasWalletExtension(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !!(window as any).solana ||
            !!(window as any).phantom ||
            !!(window as any).solflare
        );
    }, []);

    const renderWalletButton = (extraClass = "") => {
        if (!connected) {
            if (hasWalletExtension) {
                return <WalletMultiButton className={`wallet-button ${extraClass}`} />;
            }
            return (
                <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer"
                    className={`wallet-button wallet-install-btn ${extraClass}`}>
                    Install Wallet
                </a>
            );
        }
        return <WalletMultiButton className={`wallet-button ${extraClass}`} />;
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="navbar-container">
                {/* Logo */}
                <button type="button" className="navbar-brand" onClick={handleLogoClick} aria-label="Go to homepage">
                    <div className="logo-icon">
                        <Image src="/logo.png" alt="SahayogFund" width={56} height={56} className="logo-img" priority />
                    </div>
                    <span className="logo-text">SahayogFund</span>
                </button>

                {/* Hamburger Button - Mobile Only */}
                <button
                    type="button"
                    className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
                    onClick={toggleMobileMenu}
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="navbar-mobile-menu"
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                </button>

                {/* Desktop Right Section */}
                <div className="navbar-right navbar-desktop">
                    <div className="nepal-badge" aria-label="Made for Nepal">
                        <span className="nepal-flag">🇳🇵</span>
                        <span>Nepal</span>
                    </div>
                    <LanguageToggle />
                    <Link href="/verify" className="nav-link">Verify</Link>
                    <div className="solana-badge" aria-label="Powered by Solana">
                        <svg viewBox="0 0 397.7 311.7" className="solana-icon" aria-hidden="true">
                            <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00FFA3" />
                                <stop offset="100%" stopColor="#DC1FFF" />
                            </linearGradient>
                            <path fill="url(#solanaGradient)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" />
                            <path fill="url(#solanaGradient)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" />
                            <path fill="url(#solanaGradient)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" />
                        </svg>
                        <span>Solana</span>
                    </div>

                    {/* Connected Wallet Info */}
                    {connected && publicKey && (
                        <div className="wallet-info">
                            <span className="wallet-connected-dot" />
                            <span className="wallet-addr">{truncateAddress(publicKey.toString())}</span>
                            {balance !== null && (
                                <span className="wallet-balance-badge">{balance.toFixed(4)} SOL</span>
                            )}
                        </div>
                    )}

                    {renderWalletButton()}
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
                )}

                {/* Mobile Menu Panel */}
                <div id="navbar-mobile-menu" className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`} role="dialog" aria-label="Mobile navigation menu">
                    <div className="mobile-menu-content">
                        {connected && publicKey && (
                            <div className="mobile-wallet-info">
                                <div className="mobile-wallet-header">
                                    <span className="wallet-connected-dot" />
                                    <span>Connected</span>
                                </div>
                                <div className="mobile-wallet-address">{truncateAddress(publicKey.toString())}</div>
                                {balance !== null && (
                                    <div className="mobile-wallet-balance">{balance.toFixed(4)} SOL</div>
                                )}
                                <button className="mobile-disconnect-btn" onClick={() => { disconnect(); setMobileMenuOpen(false); }}>
                                    Disconnect
                                </button>
                            </div>
                        )}
                        <div className="mobile-menu-actions">
                            <Link href="/verify" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🔍 Verify Campaign</Link>
                            <div className="nepal-badge mobile-badge"><span className="nepal-flag">🇳🇵</span><span>Nepal</span></div>
                            <LanguageToggle />
                            <div className="solana-badge mobile-badge">
                                <svg viewBox="0 0 397.7 311.7" className="solana-icon" aria-hidden="true">
                                    <linearGradient id="solanaGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#00FFA3" /><stop offset="100%" stopColor="#DC1FFF" />
                                    </linearGradient>
                                    <path fill="url(#solanaGradientMobile)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" />
                                    <path fill="url(#solanaGradientMobile)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" />
                                    <path fill="url(#solanaGradientMobile)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" />
                                </svg>
                                <span>Solana</span>
                            </div>
                        </div>
                        <div className="mobile-wallet-connect">
                            {renderWalletButton("mobile-wallet-btn")}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

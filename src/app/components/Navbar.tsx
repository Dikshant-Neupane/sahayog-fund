"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import LanguageToggle from "./LanguageToggle";

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
    const handleLogoClick = () => {
        if (onLogoClick) {
            onLogoClick();
        }
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="navbar-container">
                {/* Logo Section - Clickable to go home */}
                <button
                    type="button"
                    className="navbar-brand"
                    onClick={handleLogoClick}
                    aria-label="Go to homepage"
                >
                    <div className="logo-icon">
                        <Image
                            src="/logo.png"
                            alt="SahayogFund"
                            width={56}
                            height={56}
                            className="logo-img"
                            priority
                        />
                    </div>
                    <span className="logo-text">SahayogFund</span>
                </button>

                {/* Right Section */}
                <div className="navbar-right">
                    {/* Nepal Badge */}
                    <div className="nepal-badge" aria-label="Made for Nepal">
                        <span className="nepal-flag">🇳🇵</span>
                        <span>Nepal</span>
                    </div>
                    
                    {/* Language Toggle */}
                    <LanguageToggle />
                    
                    {/* Solana Badge */}
                    <div className="solana-badge" aria-label="Powered by Solana">
                        <svg
                            viewBox="0 0 397.7 311.7"
                            className="solana-icon"
                            aria-hidden="true"
                        >
                            <linearGradient
                                id="solanaGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#00FFA3" />
                                <stop offset="100%" stopColor="#DC1FFF" />
                            </linearGradient>
                            <path
                                fill="url(#solanaGradient)"
                                d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
                            />
                            <path
                                fill="url(#solanaGradient)"
                                d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
                            />
                            <path
                                fill="url(#solanaGradient)"
                                d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
                            />
                        </svg>
                        <span>Solana</span>
                    </div>

                    {/* Wallet Button */}
                    <WalletMultiButton className="wallet-button" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

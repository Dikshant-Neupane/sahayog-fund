"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onFinished: () => void;
  minDuration?: number;
}

export default function SplashScreen({ onFinished, minDuration = 2200 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, minDuration);

    const removeTimer = setTimeout(() => {
      onFinished();
    }, minDuration + 600); // 600ms for fade-out animation

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinished, minDuration]);

  return (
    <div className={`splash-screen ${fadeOut ? "splash-fade-out" : ""}`} aria-label="Loading SahayogFund">
      {/* Background glow effects */}
      <div className="splash-glow splash-glow-1" />
      <div className="splash-glow splash-glow-2" />

      {/* Logo */}
      <div className="splash-logo-container">
        <div className="splash-logo">
          <Image
            src="/logo.png"
            alt="SahayogFund"
            width={180}
            height={180}
            priority
            className="splash-logo-img"
          />
        </div>
        <div className="splash-brand">
          <span className="splash-brand-text">SahayogFund</span>
          <span className="splash-tagline">सहयोग — Transparent Giving</span>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="splash-loader">
        <div className="splash-loader-bar">
          <div className="splash-loader-fill" />
        </div>
      </div>
    </div>
  );
}

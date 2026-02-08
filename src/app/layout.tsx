import type { Metadata } from "next";
import { Inter, Mukta } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "./contexts/WalletContextProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Mukta for Nepali/Devanagari support
const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-mukta",
});

export const metadata: Metadata = {
  title: "SahayogFund | Blockchain Donation Platform on Solana",
  description:
    "Donate to verified causes worldwide using your crypto wallet. No signup required. Powered by Solana blockchain for instant, transparent, and secure transactions.",
  keywords: [
    "blockchain donations",
    "Solana",
    "crypto charity",
    "web3 giving",
    "decentralized donations",
    "Nepal donations",
    "सहयोग",
  ],
  openGraph: {
    title: "SahayogFund - Donate Without Boundaries",
    description: "Empower global giving through blockchain technology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mukta.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ErrorBoundary>
          <LanguageProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

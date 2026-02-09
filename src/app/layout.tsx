import type { Metadata, Viewport } from "next";
import { Inter, Mukta } from "next/font/google";
import "./globals.css";
import WalletContextProvider from "./contexts/WalletContextProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Script from "next/script";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1A202C",
};

export const metadata: Metadata = {
  title: "SahayogFund - Crowdfunding Platform for Social Causes",
  description:
    "Donate directly to verified causes with Solana. Instant transfers, 100% transparent, and secure. Join the revolution in decentralized giving.",
  keywords: [
    "crowdfunding platform",
    "social causes",
    "solana charity",
    "blockchain donation",
    "transparent giving",
    "Sahayog Fund",
    "Nepal"
  ],
  openGraph: {
    title: "SahayogFund - Crowdfunding for Social Causes",
    description: "Empower global giving through blockchain technology. Start a campaign or donate today.",
    url: "https://sahayogfund.com", // Example URL
    siteName: "SahayogFund",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "SahayogFund Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SahayogFund - Blockchain Crowdfunding",
    description: "Transparent, instant donations on Solana.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://sahayogfund.com",
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

        {/* Google Analytics - Replace G-XXXXXXXXXX with your actual measurement ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

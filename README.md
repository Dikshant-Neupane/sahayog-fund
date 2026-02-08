<h1 align="center">
  <br />
  SahayogFund
  <br />
  <sub>सहयोगफन्ड - Transparent Donation Platform on Solana</sub>
</h1>

<p align="center">
  <strong>🇳🇵 Empowering Nepali communities through transparent, blockchain-powered microfinance.</strong>
</p>

<p align="center">
  <a href="#demo">View Demo</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#solana-features">Solana Features</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Anchor-0.30-blue?style=for-the-badge" alt="Anchor Framework" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 🎯 Problem Statement

> "Many Nepalis want to donate to verified causes but don't trust random fundraisers."

Traditional charitable giving in Nepal faces critical challenges:

| Problem | Impact |
|---------|--------|
| **Opacity** | Donors can't verify if funds reach beneficiaries |
| **High Fees** | 5-10% lost to banking intermediaries |
| **Slow Settlement** | Cross-border donations take days |
| **Trust Deficit** | No accountability for fund utilization |

**SahayogFund** solves this by leveraging Solana's speed and transparency to create Nepal's first trustless donation platform.

---

## ✨ Features

### Core Functionality
- ⚡ **Instant Transactions** — Donations settle in <400ms on Solana
- 🛡️ **Full Transparency** — Every contribution verifiable on Solana Explorer
- 💰 **Micro-Donations** — Fees <$0.001 enable donations as low as 0.01 SOL
- 🔒 **Non-Custodial** — Smart contracts handle fund flow, no central authority
- 🌐 **Bilingual UI** — English & Nepali (नेपाली) language support

### User Experience
- 📱 **Mobile-First Design** — Responsive, touch-optimized interface
- 🌙 **Dark Mode** — Eye-friendly theme with gradient accents
- 🎉 **Celebration Animations** — Confetti burst on successful donations
- ⏳ **Skeleton Loaders** — Smooth loading states throughout
- ♿ **Accessibility** — ARIA labels, keyboard navigation, skip links

### Solana-Native Features
- 🏷️ **Token Extensions** — Transfer fees for platform sustainability
- 📜 **On-Chain Metadata** — Campaign verification badges stored on-chain
- 🎖️ **Compressed NFTs** — Donor recognition badges (cNFTs)
- 💳 **Multi-Token Support** — SOL + USDC donations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Navbar    │  │   Wallet    │  │   Language Provider     │  │
│  │  + Toggle   │  │   Adapter   │  │   (EN 🇬🇧 / NE 🇳🇵)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Campaign Grid                            ││
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       ││
│  │   │Campaign │  │Campaign │  │Campaign │  │Campaign │       ││
│  │   │  Card   │  │  Card   │  │  Card   │  │  Card   │       ││
│  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌───────────────────────┐  ┌───────────────────────────────┐  │
│  │   Donation Form       │  │   Transaction History         │  │
│  │   - Preset amounts    │  │   - On-chain data             │  │
│  │   - Custom input      │  │   - Explorer links            │  │
│  │   - Confetti 🎉       │  │   - Real-time updates         │  │
│  └───────────────────────┘  └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ RPC (Solana Wallet Adapter)
┌─────────────────────────────────────────────────────────────────┐
│                    SOLANA BLOCKCHAIN (Devnet)                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              SAHAYOG DONATION PROGRAM (Anchor)              ││
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐  ││
│  │  │ DonationState   │  │         Instructions            │  ││
│  │  │ ─────────────── │  │  ┌────────────────────────────┐ │  ││
│  │  │ • total_donated │  │  │ initialize()               │ │  ││
│  │  │ • donor_count   │  │  │ donate(amount, message)    │ │  ││
│  │  │ • fund_wallet   │  │  │ withdraw(amount)           │ │  ││
│  │  └─────────────────┘  │  └────────────────────────────┘ │  ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    TOKEN EXTENSIONS                         ││
│  │  • Transfer Fees (1% platform sustainability)               ││
│  │  • Metadata Pointer (Campaign verification)                 ││
│  │  • cNFT Donor Badges (Compressed NFTs)                      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, CSS Variables, Framer Motion |
| **Blockchain** | Solana (Devnet), Anchor Framework |
| **Wallet** | Solana Wallet Adapter (Phantom) |
| **State** | React Context (Wallet, Language, Theme) |
| **Testing** | Vitest, React Testing Library |
| **Hosting** | Firebase Hosting |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm / npm / yarn
- Solana Wallet Extension (Phantom or Solflare)
- Devnet SOL for testing ([Faucet](https://faucet.solana.com))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Dikshant-Neupane/sahayog-fund.git
cd sahayog-fund

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your RPC endpoint

# Run development server
npm run dev
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<your-program-id>
```

---

## 🔗 Solana Program Deployment

### Using Solana Playground (Recommended)

1. Open [Solana Playground](https://beta.solpg.io)
2. Create new **Anchor (Rust)** project
3. Copy contents of `anchor/programs/sahayog_donation/src/lib.rs`
4. Build → Deploy to **Devnet**
5. Copy Program ID to `src/config/solana.ts`

### Program Interface

```rust
// Key Instructions
pub fn initialize(ctx: Context<Initialize>) -> Result<()>
pub fn donate(ctx: Context<Donate>, amount: u64, message: String) -> Result<()>
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()>

// Account Structure
#[account]
pub struct DonationState {
    pub total_donated: u64,      // Total SOL donated (lamports)
    pub donor_count: u64,        // Unique donor count
    pub fund_wallet: Pubkey,     // Treasury wallet
    pub bump: u8,                // PDA bump seed
}
```

---

## 🎖️ Solana Native Features

### 1. Token Extensions (Transfer Fees)
Platform sustainability through automated 1% transfer fee:

```rust
// Configured in token mint
transfer_fee_config: TransferFeeConfig {
    transfer_fee_basis_points: 100, // 1%
    maximum_fee: 1_000_000,         // Cap at 0.001 SOL
}
```

### 2. Compressed NFTs (Donor Badges)
Recognition badges for donors using Bubblegum:

| Badge | Requirement | Rarity |
|-------|------------|--------|
| 🥉 First Donor | Any donation | Common |
| 🥈 Champion | 10+ donations | Uncommon |
| 🥇 Visionary | 1+ SOL total | Rare |
| 💎 Legend | 10+ SOL total | Legendary |

### 3. On-Chain Metadata
Campaign verification stored using Metaplex:

```typescript
{
  name: "Verified Campaign",
  symbol: "SHYG",
  uri: "https://arweave.net/...",
  attributes: [
    { trait_type: "Verified", value: "true" },
    { trait_type: "Category", value: "Education" }
  ]
}
```

---

## 📊 Business Model

| Metric | Traditional | SahayogFund |
|--------|-------------|-------------|
| Platform Fee | 5-8% | **1%** |
| Transaction Fee | $0.30+ | **<$0.001** |
| Cross-Border Fee | 3-5% | **$0** |
| Settlement Time | 3-5 days | **<1 second** |
| Minimum Donation | $5+ | **$0.01** |
| Transparency | Limited | **100% on-chain** |

### Revenue Sustainability
- 1% platform fee via Token Extensions
- Optional donor tips
- Premium campaign verification
- API access for enterprise integrations

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- CampaignCard.test.tsx
```

---

## 📁 Project Structure

```
sahayog-fund/
├── anchor/                     # Solana program (Rust)
│   └── programs/
│       └── sahayog_donation/
│           └── src/lib.rs      # Smart contract logic
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── components/         # React components
│   │   │   ├── CampaignCard.tsx
│   │   │   ├── DonateButton.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   └── ...
│   │   ├── contexts/           # React contexts
│   │   │   ├── WalletContextProvider.tsx
│   │   │   └── LanguageContext.tsx
│   │   ├── lib/                # Data & constants
│   │   └── globals.css         # Global styles
│   ├── config/                 # Configuration
│   └── hooks/                  # Custom React hooks
│       ├── useDonate.ts
│       ├── useDonationProgram.ts
│       └── useDonationStats.ts
└── README.md
```


## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built with ❤️ for Nepal 🇳🇵</strong>
  <br />
  <sub>Powered by Solana ◎</sub>
</p>

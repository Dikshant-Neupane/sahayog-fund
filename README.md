<h1 align="center">
  <br />
  SahayogFund
  <br />
  <sub>सहयोगफन्ड — Transparent Donation Platform on Solana</sub>
</h1>

<p align="center">
  <strong>🇳🇵 Empowering Nepali communities through transparent, blockchain-powered microfinance.</strong>
</p>

<p align="center">
  <a href="#demo">View Demo</a> •
  <a href="#features">Features</a> •
  <a href="#why-solana">Why Solana?</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#installation">Installation</a> •
  <a href="#smart-contract">Smart Contract</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana Devnet" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Anchor-0.30-blue?style=for-the-badge" alt="Anchor Framework" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
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
| **No Micro-donations** | Minimum $5+ makes small giving impossible |

**SahayogFund** solves this by leveraging Solana's speed and transparency to create Nepal's first trustless donation platform.

---

## 🔗 Why Solana? <a id="why-solana"></a>

We evaluated Ethereum, Polygon, Avalanche, and Solana for this use case. Here's why Solana won:

### Technical Justification

| Criteria | Ethereum | Polygon | Solana | Winner |
|----------|----------|---------|--------|--------|
| **Transaction Cost** | $2-50 | $0.01-0.10 | **$0.00025** | ✅ Solana |
| **Finality** | 12-15 min | 2-5 min | **400ms** | ✅ Solana |
| **TPS (theoretical)** | 15-30 | 7,000 | **65,000** | ✅ Solana |
| **Micro-donation viability** | ❌ Fees > donation | ⚠️ Marginal | **✅ $0.01 donations work** | ✅ Solana |
| **Wallet UX** | MetaMask (complex) | MetaMask | **Phantom (simple)** | ✅ Solana |
| **Mobile wallet** | Limited | Limited | **Phantom Mobile** | ✅ Solana |

### Why Not Ethereum/Polygon?
- **Gas fees kill micro-donations**: A $0.50 donation on Ethereum costs $2-50 in gas (400%-10,000% overhead). On Solana, the same donation costs $0.00025 (0.05% overhead).
- **Finality matters for trust**: Donors seeing "confirmed in 400ms" builds confidence. Waiting 15 minutes does not.
- **Nepal context**: Low average donation amounts ($1-10 range) make Solana the only economically viable L1.

### Solana-Native Features We Use
1. **System Program Transfers** — Direct SOL transfers with ~$0.00025 fees
2. **Anchor Framework** — Type-safe smart contract development with PDAs
3. **Wallet Adapter** — One-click Phantom wallet connection, no seed phrases to manage
4. **On-Chain State** — Campaign stats (total donated, donor count) stored in PDAs
5. **Transaction Explorer Links** — Every donation has a verifiable Solana Explorer link

---

## ✨ Features

### Core Functionality
- ⚡ **Instant Transactions** — Donations settle in <400ms on Solana
- 🛡️ **Full Transparency** — Every contribution verifiable on Solana Explorer
- 💰 **Micro-Donations** — Fees <$0.001 enable donations as low as 0.001 SOL
- 🔒 **Non-Custodial** — Smart contracts handle fund flow, no central authority
- 🌐 **Bilingual UI** — English & Nepali (नेपाली) language support

### Smart Contract Security
- 🔑 **Signer Validation** — Only campaign authority can withdraw funds
- ⏰ **Withdrawal Deadline** — Funds locked until campaign deadline passes
- 📏 **Donation Limits** — Min 0.0001 SOL / Max 500 SOL (whale attack prevention)
- 🛑 **Emergency Pause** — Authority can pause campaigns instantly
- 💸 **Refund Mechanism** — Authority-initiated refunds for failed campaigns
- 📅 **Max Duration** — 180-day maximum campaign duration limit

### User Experience
- 📱 **Mobile-First Design** — Responsive, touch-optimized with 44px+ tap targets
- 🔍 **Search & Filter** — Search campaigns by name, location, category, or tags
- 🎉 **Celebration Animations** — Confetti burst on successful donations
- ⏳ **Multi-phase Loading** — "Building tx → Approve in wallet → Confirming on-chain"
- 🚫 **Smart Disabled States** — Buttons disabled during tx + when validation fails
- 📊 **Platform Statistics** — Total raised, total donors, campaigns funded
- 🌺 **Social Proof Feed** — Live recent donations ticker
- 🚩 **Report Campaign** — Flag suspicious campaigns for review

### Solana-Native Features
- 🏷️ **Token Extensions** — Transfer fees for platform sustainability
- 📜 **On-Chain Metadata** — Campaign verification badges stored on-chain
- 🎖️ **Compressed NFTs** — Donor recognition badges (cNFTs)
- 💳 **Multi-Token Support** — SOL + USDC donations

---

## 🏗️ Architecture <a id="architecture"></a>

```
┌────────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Next.js 15)                      │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────────────────┐   │
│  │  Navbar  │ │  Wallet  │ │  Language   │ │  Error Boundary   │   │
│  │ + Search │ │  Adapter │ │  Provider   │ │  (React)          │   │
│  └──────────┘ └──────────┘ └────────────┘ └───────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │               Campaign Grid + Search + Filter              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │    │
│  │  │ Campaign │ │ Campaign │ │ Campaign │ │ Campaign │      │    │
│  │  │   Card   │ │   Card   │ │   Card   │ │   Card   │      │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │    │
│  └────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐   │
│  │    Donation Form     │  │      Social Proof Feed           │   │
│  │ - Quick amounts      │  │  - Recent donations ticker       │   │
│  │ - Min/Max validation │  │  - Platform stats bar            │   │
│  │ - Multi-phase loader │  │  - Donor count + total raised    │   │
│  │ - Confetti 🎉        │  │  - Live on Solana indicator      │   │
│  └──────────────────────┘  └──────────────────────────────────┘   │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐   │
│  │   Report Campaign    │  │    Fundraiser Verification       │   │
│  │   🚩 Flag system     │  │    Form + Map Picker             │   │
│  └──────────────────────┘  └──────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ RPC (Solana Wallet Adapter)
┌────────────────────────────────────────────────────────────────────┐
│                   SOLANA BLOCKCHAIN (Devnet)                       │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │           SAHAYOG DONATION PROGRAM (Anchor/Rust)           │   │
│  │                                                            │   │
│  │  ┌───────────────────┐  ┌────────────────────────────┐    │   │
│  │  │  DonationState    │  │      Instructions          │    │   │
│  │  │  (PDA Account)    │  │                            │    │   │
│  │  │  ────────────────  │  │  initialize(wallet, deadline) │   │
│  │  │  • authority      │  │  donate(amount, message)   │    │   │
│  │  │  • fund_wallet    │  │  withdraw(amount)          │    │   │
│  │  │  • total_donated  │  │    ↳ signer validation ✅   │    │   │
│  │  │  • total_withdrawn│  │    ↳ deadline check ✅      │    │   │
│  │  │  • donor_count    │  │  refund(amount)            │    │   │
│  │  │  • is_active      │  │  toggle_active()           │    │   │
│  │  │  • deadline       │  │                            │    │   │
│  │  │  • bump           │  │  Errors: 13 custom types   │    │   │
│  │  └───────────────────┘  └────────────────────────────┘    │   │
│  │                                                            │   │
│  │  SECURITY CONSTRAINTS:                                     │   │
│  │  • Min donation:  0.0001 SOL  • Max donation: 500 SOL     │   │
│  │  • Max duration:  180 days    • Signer verified withdraw   │   │
│  │  • PDA fund_wallet validation • Authority-only refunds     │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Deployment
┌────────────────────────────────────────────────────────────────────┐
│  Frontend: Vercel (Edge Network, auto-deploy from GitHub)         │
│  Program:  Solana Devnet → Mainnet-beta (via Solana Playground)  │
│  RPC:      Helius / QuickNode / Default Devnet RPC               │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, CSS Custom Properties, Framer Motion |
| **Blockchain** | Solana (Devnet), Anchor Framework 0.32 |
| **Wallet** | Solana Wallet Adapter (Phantom, Solflare) |
| **State** | React Context (Wallet, Language, Theme) |
| **Notifications** | React Hot Toast |
| **Hosting** | Vercel (Edge Network) |
| **Smart Contract** | Rust + Anchor (PDAs, Custom Errors, Constraints) |

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
NEXT_PUBLIC_PROGRAM_ID=Buv5zyTkgj1pDDLKrt9q6Yy39vndTfFumEk7cLdwzmsA
```

---

## 🔐 Smart Contract (Anchor/Rust) <a id="smart-contract"></a>

### Program ID
```
Buv5zyTkgj1pDDLKrt9q6Yy39vndTfFumEk7cLdwzmsA
```

### Instructions

| Instruction | Access | Description |
|------------|--------|-------------|
| `initialize(fund_wallet, deadline)` | Authority | Create campaign with wallet + deadline |
| `donate(amount, message)` | Any signer | Donate SOL with message (0.0001-500 SOL) |
| `withdraw(amount)` | Authority only | Withdraw after deadline passes |
| `refund(amount)` | Authority only | Refund donors for failed campaigns |
| `toggle_active()` | Authority only | Emergency pause/unpause |

### Security Features

```rust
// Signer validation on every privileged operation
#[account(
    constraint = authority.key() == donation_state.authority @ SahayogError::Unauthorized
)]
pub authority: Signer<'info>,

// Withdrawal only after deadline
require!(clock.unix_timestamp >= state.deadline, SahayogError::WithdrawalBeforeDeadline);

// Donation amount bounds
require!(amount >= MIN_DONATION_LAMPORTS, SahayogError::DonationTooSmall);  // 0.0001 SOL
require!(amount <= MAX_DONATION_LAMPORTS, SahayogError::DonationTooLarge);  // 500 SOL

// Max campaign duration: 180 days
require!(deadline <= now + MAX_CAMPAIGN_DURATION, SahayogError::CampaignTooLong);
```

### Custom Error Codes (13 types)
`Unauthorized` | `CampaignInactive` | `CampaignExpired` | `DonationTooSmall` | `DonationTooLarge` | `MessageTooLong` | `DeadlineInPast` | `CampaignTooLong` | `WithdrawalBeforeDeadline` | `InsufficientFunds` | `ZeroAmount` | `InvalidFundWallet`

### Deployment

1. Open [Solana Playground](https://beta.solpg.io)
2. Create new **Anchor (Rust)** project
3. Copy contents of `anchor/programs/sahayog_donation/src/lib.rs`
4. Build → Deploy to **Devnet**
5. Copy Program ID to `src/config/solana.ts`

---

## 🎖️ Solana Native Features

### 1. Token Extensions (Transfer Fees)
Platform sustainability through automated 1% transfer fee:

```rust
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

## 🚀 Deployment Strategy <a id="deployment"></a>

### Frontend (Vercel)
```bash
# One-command deploy
npx vercel --prod

# Or connect GitHub repo for auto-deploy
# Push to main → Vercel builds automatically
```

**Why Vercel?**
- Zero-config Next.js hosting (built by same team)
- Edge network for global low-latency
- Automatic HTTPS, preview deployments on PRs
- Free tier sufficient for hackathon + early users

### Smart Contract (Solana)
| Stage | Network | RPC |
|-------|---------|-----|
| Development | Devnet | `https://api.devnet.solana.com` |
| Staging | Devnet | Helius/QuickNode (rate-limited) |
| Production | Mainnet-beta | Helius Pro / Triton |

### CI/CD Pipeline
```
GitHub Push → Vercel Build → Preview Deploy
                ↓ (on merge to main)
            Production Deploy (vercel.app)
```

---

## 📊 Business Model & Competitive Analysis

### vs. Traditional Platforms

| Metric | GoFundMe | Ketto (India) | SahayogFund |
|--------|----------|---------------|-------------|
| Platform Fee | 0% + payment processing 2.9% | 5-8% | **1%** |
| Transaction Fee | $0.30+ per tx | $0.15+ | **<$0.001** |
| Cross-Border Fee | 3-5% | 3-5% | **$0** |
| Settlement Time | 3-5 business days | 3-7 days | **<1 second** |
| Minimum Donation | $5 | ₹100 (~$1.20) | **$0.01** |
| Transparency | Limited reporting | Limited | **100% on-chain** |
| Requires Signup | Yes (email + ID) | Yes (phone + ID) | **No (wallet only)** |
| Nepal Support | Limited | India only | **🇳🇵 Built for Nepal** |

### Revenue Sustainability
- **1% platform fee** via Token Extensions (automated, on-chain)
- **Optional donor tips** at checkout
- **Premium campaign verification** for organizations
- **API access** for enterprise integrations
- **White-label solutions** for NGOs

### Go-to-Market Strategy
1. **Phase 1 (Hackathon)**: Launch on Devnet, demonstrate core functionality
2. **Phase 2 (Beta)**: Onboard 5-10 verified NGOs in Kathmandu, testnet
3. **Phase 3 (Launch)**: Mainnet deployment, Phantom wallet partnership
4. **Phase 4 (Scale)**: Multi-country expansion, Jupiter integration for multi-token

---

## 📁 Project Structure

```
sahayog-fund/
├── anchor/                     # Solana program (Rust)
│   └── programs/
│       └── sahayog_donation/
│           └── src/lib.rs      # Smart contract (5 instructions, 13 errors)
├── public/                     # Static assets (logo, index.html)
├── src/
│   ├── app/
│   │   ├── components/         # React components
│   │   │   ├── CampaignCard.tsx    # Campaign grid cards
│   │   │   ├── DonateButton.tsx    # Donation flow + validation
│   │   │   ├── DonationForm.tsx    # Alt donation form (donate page)
│   │   │   ├── DonationStats.tsx   # Platform statistics
│   │   │   ├── ErrorBoundary.tsx   # Crash recovery
│   │   │   ├── FundraiserForm.tsx  # Campaign creation form
│   │   │   ├── LanguageToggle.tsx  # EN/NE language switch
│   │   │   ├── MapPicker.tsx       # Leaflet location picker
│   │   │   ├── MissionSection.tsx  # Our vision section
│   │   │   ├── Navbar.tsx          # Navigation + wallet
│   │   │   ├── SplashScreen.tsx    # Loading animation
│   │   │   └── TransactionHistory.tsx # On-chain tx feed
│   │   ├── contexts/           # React contexts
│   │   │   ├── WalletContextProvider.tsx
│   │   │   └── LanguageContext.tsx  # EN/NE translations
│   │   ├── donate/             # /donate route
│   │   ├── lib/                # Data & constants
│   │   │   ├── campaigns.json  # Campaign data
│   │   │   └── constants.ts    # App constants
│   │   ├── globals.css         # 3300+ lines Nepal-themed CSS
│   │   ├── layout.tsx          # Root layout + providers
│   │   └── page.tsx            # Main page (search, feed, grid)
│   ├── config/
│   │   └── solana.ts           # Program ID, RPC config
│   └── hooks/
│       ├── useDonate.ts        # Donation hook (Anchor)
│       ├── useDonationProgram.ts  # Program connection
│       └── useDonationStats.ts    # Stats polling
├── package.json
├── tsconfig.json
└── README.md                   # This file
```

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

### Manual Testing Checklist
- [ ] Connect Phantom wallet on Devnet
- [ ] Get Devnet SOL from [faucet.solana.com](https://faucet.solana.com)
- [ ] Donate 0.1 SOL to any campaign → verify confetti + toast
- [ ] Try donating 0 SOL → verify error toast
- [ ] Try donating without wallet → verify "connect wallet" toast
- [ ] Search for "education" → verify filter works
- [ ] Switch language to Nepali → verify all text changes
- [ ] View on mobile (375px) → verify responsive layout
- [ ] Copy wallet address → verify clipboard toast

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Built with ❤️ for Nepal 🇳🇵</strong>
  <br />
  <sub>Powered by Solana ◎ | Deployed on Vercel ▲</sub>
</p>

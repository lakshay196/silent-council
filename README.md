# Silent Council

> **Verified Onchain Anonymous Student Voting for NITK.**  
> Built for the [Road to Devcon — NITK Surathkal](https://road-to-devcon-nitk-surathkal.devfolio.co/overview) Hackathon (Track: *Make Private Apps using Ethereum*).

---

## 💡 The Problem

Student council elections and campus referendums in Indian colleges suffer from three critical flaws:
1. **Rigged & Manipulated Counts**: Paper ballots get lost; centralized forms and Excel sheets can be easily altered.
2. **Zero Voter Privacy**: Google Forms and WhatsApp polls leak identity, leading to intimidation or reluctance to vote against faculty/club-backed proposals.
3. **Turnout Deficit**: Lack of trust in counting leads to low engagement.

---

## 🛡️ The Solution: Silent Council

Silent Council is a decentralized voting application where:
- **Every voter is verified**: Students prove ownership of an authorized institutional email (`@nitk.edu.in` or demo accounts) without ever revealing their identity onchain.
- **Every ballot is anonymous & secret**: Votes are decoupled from voter wallets using cryptographic **nullifiers**.
- **Every tally is auditable onchain**: Tallies and votes are recorded directly on **Base Sepolia** smart contracts.
- **Sybil-Resistant & Double-Vote Protected**: Each student identity can vote exactly once per proposal forever.

---

## 🏗️ Architecture & Verification Sequence

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          STUDENT BROWSER                                │
│  ┌───────────────┐    ┌────────────────┐    ┌────────────────────────┐  │
│  │  Next.js 15   │───▶│  ZK-Email SDK  │───▶│ RainbowKit + Wagmi     │  │
│  │  Frontend     │    │  (Proof Gen)   │    │ (Base Sepolia Wallet)  │  │
│  └───────┬───────┘    └────────┬───────┘    └────────────┬───────────┘  │
└──────────┼─────────────────────┼─────────────────────────┼──────────────┘
           │                     │                         │
           │ REST                │ ZK Proof / OTP          │ RPC Transactions
           ▼                     ▼                         ▼
┌────────────────────┐  ┌──────────────────────┐  ┌────────────────────────┐
│  Next.js APIs      │  │  Prover Network /    │  │  Base Sepolia          │
│  - /api/attest     │  │  DKIM Signature      │  │  (Chain ID 84532)      │
│  - /api/vote       │  └──────────────────────┘  │  ┌──────────────────┐  │
│  - /api/proposals  │                            │  │ SilentCouncil.sol│  │
│  - /api/verify-otp │                            │  │ 0x4838...1130    │  │
└────────┬───────────┘                            │  └──────────────────┘  │
         │                                        │  ┌──────────────────┐  │
         │ SQL                                    │  │ EAS Attestations │  │
         ▼                                        │  │ 0x4200...0021    │  │
┌────────────────────┐                            │  └──────────────────┘  │
│  Supabase Postgres │                            └────────────────────────┘
│  - proposals       │
│  - votes (metadata)│
│  - verified_users  │
└────────────────────┘
```

---

## 🔗 Deployed Contracts & Attestations

| Entity | Address / Identifier | Link |
|---|---|---|
| **SilentCouncil Contract** | `0x4838024E8611d4E67fe6B9f6f43559A7e0971130` | [Basescan Explorer](https://sepolia.basescan.org/address/0x4838024E8611d4E67fe6B9f6f43559A7e0971130) |
| **EAS Contract** | `0x4200000000000000000000000000000000000021` | [Basescan Explorer](https://sepolia.basescan.org/address/0x4200000000000000000000000000000000000021) |
| **EAS Schema UID** | `0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518` | [EASscan Schema](https://base-sepolia.easscan.org/schema/view/0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518) |
| **Network** | Base Sepolia Testnet | Chain ID: `84532` |

---

## 🔐 Cryptography & Trust Model

### Nullifier Derivation
To prevent Sybil attacks and double voting while preserving anonymity:
$$\text{Nullifier} = \text{keccak256}(\text{normalizedEmail} \ || \ \text{DOMAIN\_SALT})$$

1. **One Student = One Registered Wallet**: The contract enforces `nullifierToWallet[nullifier] == address(0)` during verification.
2. **One Vote Per Proposal**: The contract enforces `!_nullifierVoted[proposalId][nullifier]` during vote casting.
3. **EIP-191 Issuer Signatures**: The backend verifies proofs and signs personal messages (`keccak256(wallet, nullifier)` and `keccak256(proposalId, choice, nullifier)`) for contract verification.

---

## 💻 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui
- **Web3 / Wallet**: RainbowKit, Wagmi v2, Viem
- **Smart Contracts**: Solidity `0.8.20`, OpenZeppelin ECDSA & MessageHashUtils
- **Attestations**: Ethereum Attestation Service (EAS) on Base Sepolia
- **Identity & Verification**: `@zk-email/sdk` (with Supabase Email OTP fallback)
- **Database & Sync**: Supabase Postgres & Realtime

---

## 🚀 Getting Started (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/lakshay196/silent-council.git
cd silent-council/frontend
npm install
```

### 2. Configure Environment Variables
Create `.env.local` inside `frontend/`:
```bash
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://base-sepolia-rpc.publicnode.com
NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS=0x4838024E8611d4E67fe6B9f6f43559A7e0971130
NEXT_PUBLIC_EAS_ADDRESS=0x4200000000000000000000000000000000000021
NEXT_PUBLIC_EAS_SCHEMA_UID=0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ISSUER_PRIVATE_KEY=0xyour-issuer-private-key

NEXT_PUBLIC_ALLOWED_DOMAINS=nitk.edu.in,gmail.com
NEXT_PUBLIC_DOMAIN_SALT=silent-council-nitk-v1
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team
- **Lakshay (Team Lead)** — Frontend, UI/UX, Design, Coordination
- **Krishna** — Smart Contracts, Backend APIs, Cryptographic Integration
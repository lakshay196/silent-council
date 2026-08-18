# Silent Council — Product Requirements Document (PRD)

> **The first fully onchain, verified-but-anonymous voting system for NITK.**
> Real students, secret ballots, public tallies. No rigging, no retaliation, no low-turnout excuses.

**Hackathon:** [Road to Devcon — NITK Surathkal](https://road-to-devcon-nitk-surathkal.devfolio.co/overview) (Aug 17–23, 2026)
**Theme:** Make Private Apps using Ethereum
**Team size:** 2 (Team Lead + Contract/Backend Engineer)
**Deliverable deadline:** Friday **Aug 22, 2026, 11:59 PM IST** (target submission — Sunday Aug 23 is buffer only)

---

## 0. TL;DR

Anyone at NITK can create a proposal ("Should mess timings be extended?"). Verified NITK students prove they own an `@nitk.edu.in` email via a zero-knowledge proof (`zk.email`) — get an onchain attestation (EAS on Base Sepolia) — then vote anonymously. Their vote is recorded on a smart contract with a nullifier so they can't vote twice, but nobody (not even us) can tell who they are or what they voted.

Judges see a live demo where they sign in with a real Google account, cast a vote, watch the tally update in real time, and try to double-vote and get rejected. 90 seconds. Mic drop.

---

## 1. Vision & Pitch (2 minutes; both memorize this)

### The problem (30s)
Every Indian college has three broken voting problems:
1. **Rigged counts** — paper ballots get lost, Excel sheets get manipulated.
2. **Zero privacy** — WhatsApp polls doxx you; students afraid to vote against faculty-backed candidates.
3. **Low turnout** — nobody trusts the process, so nobody shows up.

Google Forms leaks identity. Snapshot needs a wallet everyone controls. Paper is medieval. Nothing works.

### The solution (30s)
Silent Council. Onchain voting where:
- **Every voter is verified** — must prove they own an `@nitk.edu.in` email via ZK proof (their email is never revealed, not even to us).
- **Every vote is secret** — impossible to trace a vote back to a voter.
- **Every tally is public and auditable** — anyone can independently verify the count on Base Sepolia block explorer.
- **Nobody can vote twice** — cryptographic nullifiers enforce one email = one vote per proposal, forever.

### Why now / why Ethereum (30s)
- ZK email proofs (via [zk.email](https://zk.email)) are production-ready in 2026 — you just install an SDK.
- EAS (Ethereum Attestation Service) gives us tamper-proof credentials on Base Sepolia.
- **Ethereum is the only chain where all three pieces (attestations, verifiable voting, censorship-resistance) already exist and interoperate.**

### The ask (30s)
Adopt it for the next NITK student council election. Any student club can spin up a proposal in 30 seconds. Zero infrastructure. Zero rigging. Full transparency. Real democracy at Indian colleges — starting here.

---

## 2. Product Overview (What We're Building)

### Core Features (MVP — Must Ship)

1. **Landing page** — hero pitch, "Verify with your NITK email" CTA, live counter of "N verified students, M votes cast."
2. **Verification flow** — wallet connect → sign in with Google (via zk.email blueprint that reads a Gmail message) → ZK proof generated → EAS attestation issued to your wallet on Base Sepolia. Takes ~30 seconds.
3. **Proposals feed** — browse all live and past proposals with vote counts, deadlines, categories (Academic / Hostel / Mess / Cultural / General).
4. **Proposal detail page** — full description, live tally chart (updates every 5s), vote button (Yes / No / Abstain), deadline countdown, list of onchain vote transactions (without voter identities).
5. **Cast vote** — verified users click a choice → transaction submitted → nullifier prevents double-voting → tally updates.
6. **Create proposal** — verified users can propose. Fields: title, description, category, deadline (max 7 days for demo).
7. **My dashboard** — see the attestation you hold, proposals you've voted on (only visible to *you*, stored client-side), verify your voter status.
8. **Verifiability page** — publicly viewable "how this works" page that shows the cryptographic guarantees, links to the contract on Basescan and the EAS schema on EASscan.

### Polish Features (Should Ship — Day 3–4)

9. **Real-time tally chart** — animated bar/pie chart on proposal detail page.
10. **Turnout stats** — "42% of verified NITK students have voted on this proposal."
11. **Sybil counter** — "12 double-vote attempts blocked" — visualize the sybil resistance in action.
12. **Category filters + search** on proposals feed.
13. **Beautiful dark theme** with glassmorphism, subtle animations on vote submission.
14. **Mobile-responsive** — everything works on a phone; judges will try on their phone.
15. **Seed data** — 5 realistic pre-created proposals on demo day (e.g., "Extend mess hours to 11pm?", "Ban plastic bottles in hostels?", "Increase library hours during exams?"). Makes the demo instantly relatable.
16. **Live pitch page** — a `/pitch` route with the full deck as scrollable sections, in case judges want to read.

### Stretch (Only if we're ahead — do NOT prioritize)

17. Ranked-choice / multi-option proposals.
18. Comment thread on proposals (verified anonymous).
19. Vote delegation (liquid democracy).
20. Bonus: integrate the friend's **SP1 DOB proof** as a second attestation type — restricted proposals (e.g., "Should the pub next to campus stay open until 2am?") only visible/votable by verified 18+ students. Nice narrative flex, credits the existing repo.

### Anti-scope (Do NOT build — will kill us)

- Custom ZK circuits. **Use zk.email's SDK as-is.**
- Custom RSA/JWT verification in a zkVM. **We are not doing this.**
- Multiple chains. **Base Sepolia only.**
- Multiple colleges/domains on the frontend. **Hardcode `nitk.edu.in` — mention "extensible" in pitch.**
- Native mobile app. **Web only — must be mobile-responsive.**
- User accounts / login system. **Wallet + attestation is the identity.**

---

## 3. Tech Stack (LOCKED — do not deviate)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 15** (App Router) + TypeScript | Vercel deploys in one command, best AI-IDE support |
| Styling | **Tailwind CSS 4** + **shadcn/ui** | AI-vibecode-friendly, gorgeous default components |
| Wallet | **wagmi v2 + viem + RainbowKit** | Industry standard, MetaMask/Coinbase Wallet just work |
| Auth (ZK) | **`@zk-email/sdk`** with a Gmail-based blueprint | Handles all the crypto — we just call functions |
| Onchain attestations | **EAS on Base Sepolia** (contract `0x4200000000000000000000000000000000000021`) | Tamper-proof identity credentials |
| Smart contract | **Solidity 0.8.20** — a simple `SilentCouncil.sol` | Vote storage + nullifier check + tally |
| Contract deployment | **Remix IDE in browser** (no local Foundry) | Vibecoder-friendly, MetaMask sign-and-deploy |
| Backend / DB | **Supabase** (Postgres + Auth-optional + Realtime) | Free tier, TypeScript SDK, Realtime subscriptions for live tallies |
| Hosting | **Vercel** (frontend), **Supabase cloud** (DB), **Base Sepolia** (chain) | All free tier |
| Chain | **Base Sepolia** (chain ID 84532) | Cheap gas, existing repo used it, EAS supported |
| RPC provider | **Public Base Sepolia RPC** (`https://sepolia.base.org`) | No signup |
| Analytics | **Vercel Analytics** (free) | Just enable in Vercel dashboard |
| Video demo | **Loom** or **QuickTime** + iMovie | Free |

**Node version:** 20 or 22 (both are fine, both installed).
**Package manager:** `npm` (installed). Do NOT switch to pnpm/yarn/bun mid-project.

---

## 4. Architecture

### High-level data flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                                 │
│  ┌───────────────┐    ┌────────────────┐    ┌────────────────────────┐  │
│  │ Landing / UI  │───▶│ zk.email SDK   │───▶│ wagmi + viem           │  │
│  │ (Next.js)     │    │ (in browser)   │    │ (wallet, contracts)    │  │
│  └───────┬───────┘    └────────┬───────┘    └────────────┬───────────┘  │
└──────────┼─────────────────────┼─────────────────────────┼──────────────┘
           │                     │                         │
           │ REST                │ Proof                   │ RPC call
           ▼                     ▼                         ▼
┌────────────────────┐  ┌──────────────────────┐  ┌────────────────────────┐
│  Next.js API       │  │  zk.email Registry / │  │  Base Sepolia          │
│  routes (Vercel)   │  │  Prover Network      │  │  (chain 84532)         │
│  - /api/verify     │  │  (proof gen)         │  │                        │
│  - /api/attest     │  │                      │  │  ┌──────────────────┐  │
│  - /api/proposals  │  └──────────────────────┘  │  │ SilentCouncil.sol│  │
│  - /api/vote       │                            │  │ (our contract)   │  │
└────────┬───────────┘                            │  └──────────────────┘  │
         │                                        │  ┌──────────────────┐  │
         │ SQL                                    │  │ EAS 0x4200...0021│  │
         ▼                                        │  │ (attestations)   │  │
┌────────────────────┐                            │  └──────────────────┘  │
│  Supabase Postgres │                            └────────────────────────┘
│  - proposals       │
│  - votes (metadata │
│    only, no PII)   │
│  - attestations    │
│    (cache)         │
└────────────────────┘
```

### The verify + vote sequence (memorize this — you'll pitch it)

1. User clicks **Verify with NITK email**.
2. wagmi connects wallet (MetaMask).
3. `@zk-email/sdk` initializes; user grants Gmail permission (OAuth).
4. SDK fetches an email that matches our blueprint (a Google-sent verification / welcome email at their `@nitk.edu.in` address, DKIM-signed by Google).
5. SDK generates a proof server-side (via zk.email Prover Network — ~20s). Proof asserts: *"holder controls an email at `nitk.edu.in`."*
6. Proof + public inputs sent to `/api/attest` on our Next.js API.
7. Backend verifies the proof via zk.email; computes a **nullifier** = `keccak256(email_address_from_public_input || DOMAIN_SALT)`.
8. Backend signs `{wallet, nullifier}` with our issuer key; frontend submits to `SilentCouncil.sol` which stores the wallet-to-nullifier binding and mints an EAS attestation.
9. User is now **Verified NITK** — green badge appears.
10. User opens a proposal, clicks **Vote Yes**.
11. Frontend calls `SilentCouncil.vote(proposalId, YES, nullifier, issuerSignature)`.
12. Contract checks: proposal exists + not expired + nullifier hasn't voted → increments tally → emits `Voted` event.
13. Realtime Supabase subscription pushes updated tally to all open browsers within 2 seconds.

### Why the "trusted issuer" pattern?

We could verify the zk.email proof *fully onchain* using zk.email's onchain verifier contract, but that adds ~2 days of Solidity work vibecoders can't do. So we verify the proof *off-chain* on our Vercel API (using zk.email's SDK), and our backend signs a short attestation that the contract trusts.

**This is a hackathon-acceptable trust assumption. Pitch it honestly:** *"MVP uses a trusted issuer for proof verification. Migration to fully onchain zk.email verifier contract is a 1-day post-hackathon upgrade — the primitive exists in the zk.email SDK today."* Judges appreciate honesty about scope; they hate hidden trust assumptions.

---

## 5. Prerequisites & Account Setup (BOTH DO TODAY — Aug 18, before 6 PM)

### Both of you

- [ ] **GitHub account** (free) — you probably have one
- [ ] **Node.js 20+ installed** — verify with `node -v` (both machines have this)
- [ ] **MetaMask browser extension** — install from [metamask.io](https://metamask.io)
- [ ] **Add Base Sepolia to MetaMask** — go to [chainlist.org](https://chainlist.org), search "Base Sepolia," click Add
- [ ] **Get Base Sepolia testnet ETH** — [Base Sepolia faucet](https://docs.base.org/tools/network-faucets) or [Alchemy faucet](https://sepoliafaucet.com). Aim for 0.05 ETH each. Takes 5 minutes.
- [ ] **Same shared Google Drive folder or Notion page** for demo assets, pitch deck, video
- [ ] **Same shared WhatsApp / Discord channel** for real-time comms

### Team Lead (Lakshay) — Cursor Pro user

- [ ] **Vercel account** — sign up with GitHub, we'll deploy the frontend here (free)
- [ ] **Confirm Cursor Pro is signed in** and Claude Sonnet 4.7 or GPT-5 is selected as the primary model
- [ ] **Create a fresh GitHub repo** called `silent-council` under your GitHub. Do NOT commit inside the friend's SP1 repo — start fresh so git history is yours.
- [ ] **Grant teammate write access** to the fresh repo (Settings → Collaborators)
- [ ] **Buy a domain (optional)** — `silentcouncil.xyz` or similar on Namecheap ($1–$10 for a year). Skip if tight on time; Vercel gives you a free `.vercel.app` subdomain.

### Teammate — Antigravity + Google One user

- [ ] **Confirm Antigravity is installed and Gemini 3 Pro is selected** as default model
- [ ] **Supabase account** — sign up at [supabase.com](https://supabase.com), create a new project called `silent-council`. Save the URL + anon key.
- [ ] **Save your Base Sepolia deployer wallet's private key** to a secure note. You'll need it to deploy the contract via Remix. This wallet is ONLY for deploying the contract — keep no real funds on it.
- [ ] **Get an issuer wallet** — create a *second* wallet in MetaMask called "Issuer." This wallet will sign attestations from our backend. Save its private key securely; you'll paste it into Vercel env vars later.

### Shared credentials management

- Use [1Password](https://1password.com) free trial OR a shared Notion page with restricted access. Do NOT paste keys in WhatsApp.

**If everything above isn't done by 6 PM IST today (Aug 18), we're behind. Team Lead: check in with teammate at 4 PM.**

---

## 6. Repository Structure

Fresh repo `silent-council` at the root. Structure:

```
silent-council/
├── README.md                  # public-facing, judge-friendly
├── PRD.md                     # this file (copy from ZKAttestify-Sp1-verifier)
├── PROMPTS.md                 # AI IDE bootstrap prompts (copy from ZKAttestify-Sp1-verifier)
├── AGENTS.md                  # for Antigravity + shared AI rules
├── .cursorrules               # for Cursor
├── .env.example
├── contracts/
│   ├── SilentCouncil.sol      # main contract (teammate owns)
│   └── DEPLOYMENT.md          # contract address, ABI, deploy instructions
├── frontend/                  # Next.js 15 app (team lead owns)
│   ├── app/
│   │   ├── page.tsx           # landing
│   │   ├── verify/page.tsx    # verify email flow
│   │   ├── proposals/
│   │   │   ├── page.tsx       # feed
│   │   │   ├── new/page.tsx   # create
│   │   │   └── [id]/page.tsx  # detail + vote
│   │   ├── dashboard/page.tsx
│   │   ├── pitch/page.tsx
│   │   ├── verifiability/page.tsx
│   │   └── api/
│   │       ├── verify/route.ts
│   │       ├── attest/route.ts
│   │       ├── proposals/route.ts
│   │       └── vote/route.ts
│   ├── components/
│   │   ├── ui/                # shadcn/ui
│   │   ├── vote-card.tsx
│   │   ├── tally-chart.tsx
│   │   └── verify-badge.tsx
│   ├── lib/
│   │   ├── contracts.ts       # addresses + ABI
│   │   ├── supabase.ts
│   │   ├── zk-email.ts
│   │   └── types.ts
│   ├── package.json
│   └── ...
├── docs/
│   ├── demo-script.md
│   ├── submission.md          # what we write on Devfolio
│   └── pitch-deck.pdf         # export from Canva/Slides
└── .github/
    └── workflows/             # optional CI for Vercel
```

**Convention:** teammate pushes to `main`. No branches, no PRs. Every commit message: `[FE] ...` or `[BE] ...` or `[CT] ...` (contract) or `[DX] ...` (docs). This way when you look at git log you know who touched what.

---

## 7. Intersection Contracts (Shared Interfaces — LOCK IN BEFORE BUILDING)

These are the *interfaces both sides code against*. Once locked, neither person changes them without notifying the other. **This section is the single most important part of the PRD.**

### 7.1 Environment variables (both apps read these)

Populate `.env.example` with these names; each of you fills in your own `.env.local` (never commit).

```bash
# --- Chain ---
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# --- Contract (teammate provides address after Day 1) ---
NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_EAS_ADDRESS=0x4200000000000000000000000000000000000021
NEXT_PUBLIC_EAS_SCHEMA_UID=0x0000000000000000000000000000000000000000000000000000000000000000

# --- Supabase (teammate provides) ---
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# --- Server-side only (Vercel env vars, never in NEXT_PUBLIC_) ---
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # teammate
ISSUER_PRIVATE_KEY=0x...                  # teammate
ZK_EMAIL_API_KEY=optional...              # teammate (if zk.email requires one)

# --- App config ---
NEXT_PUBLIC_ALLOWED_DOMAIN=nitk.edu.in
NEXT_PUBLIC_DOMAIN_SALT=silent-council-nitk-v1
```

### 7.2 Supabase schema (teammate creates in Supabase Studio, Day 0)

```sql
-- proposals
create table proposals (
  id uuid primary key default gen_random_uuid(),
  onchain_id text unique not null,          -- bytes32 hex from contract
  title text not null,
  description text not null,
  category text not null,                    -- 'academic'|'hostel'|'mess'|'cultural'|'general'
  deadline timestamptz not null,
  creator_wallet text not null,
  tally_yes int not null default 0,
  tally_no int not null default 0,
  tally_abstain int not null default 0,
  created_at timestamptz default now()
);

-- votes (metadata only — no PII, no linkage to voter identity beyond nullifier)
create table votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  nullifier text not null,                   -- bytes32 hex
  choice smallint not null,                  -- 0=yes, 1=no, 2=abstain
  tx_hash text not null,
  created_at timestamptz default now(),
  unique (proposal_id, nullifier)            -- enforce one vote per verified user per proposal
);

-- verified users (cache of onchain attestations for fast frontend reads)
create table verified_users (
  wallet text primary key,
  nullifier text unique not null,
  attestation_uid text not null,
  attested_at timestamptz default now()
);

-- sybil attempts (for the fun visualization)
create table sybil_attempts (
  id uuid primary key default gen_random_uuid(),
  attempted_wallet text,
  reason text,                               -- 'duplicate_nullifier'|'already_voted'|'invalid_proof'
  created_at timestamptz default now()
);
```

Enable Realtime on `votes` and `proposals` tables in Supabase dashboard so the frontend can subscribe to live tally updates.

### 7.3 Smart contract interface (teammate writes; team lead consumes)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISilentCouncil {
    struct Proposal {
        string title;
        string description;
        string category;
        uint256 deadline;
        uint256 tallyYes;
        uint256 tallyNo;
        uint256 tallyAbstain;
        address creator;
        bool exists;
    }

    event ProposalCreated(bytes32 indexed proposalId, string title, string category, uint256 deadline, address creator);
    event Voted(bytes32 indexed proposalId, uint8 choice, bytes32 nullifier);
    event VoterVerified(address indexed wallet, bytes32 nullifier);

    function createProposal(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 deadline
    ) external returns (bytes32 proposalId);

    function verifyVoter(
        address wallet,
        bytes32 nullifier,
        bytes calldata issuerSignature
    ) external;

    function vote(
        bytes32 proposalId,
        uint8 choice,               // 0=yes, 1=no, 2=abstain
        bytes32 nullifier,
        bytes calldata issuerSignature
    ) external;

    function getProposal(bytes32 proposalId) external view returns (Proposal memory);
    function hasVoted(bytes32 proposalId, bytes32 nullifier) external view returns (bool);
    function isVerified(address wallet) external view returns (bool);
}
```

Teammate: implement this interface. Team lead: import ABI into `frontend/lib/contracts.ts` once teammate delivers the deployed address.

### 7.4 API contracts (teammate implements; team lead consumes)

All routes live under `frontend/app/api/`. **Both** of you agree on these signatures NOW; do not change without notifying the other.

#### `POST /api/attest`
Request:
```ts
{
  wallet: string;              // 0x...
  zkEmailProof: unknown;       // the full proof object returned by @zk-email/sdk
  publicInputs: unknown;       // public inputs from the proof
}
```
Response (success):
```ts
{
  ok: true;
  nullifier: string;           // 0x... (bytes32)
  issuerSignature: string;     // 0x... signed by ISSUER_PRIVATE_KEY
  attestationUid: string;      // EAS UID
}
```
Response (error):
```ts
{ ok: false; error: 'invalid_proof' | 'wrong_domain' | 'already_verified' | 'server_error'; message: string }
```

#### `POST /api/proposals`
Request:
```ts
{ wallet: string; title: string; description: string; category: string; deadline: string /* ISO */ }
```
Response:
```ts
{ ok: true; proposalId: string; txHash: string } | { ok: false; error: string }
```

#### `GET /api/proposals`
Response:
```ts
{ proposals: Proposal[] }  // sorted by createdAt desc
```

#### `GET /api/proposals/:id`
Response:
```ts
{ proposal: Proposal; recentVotes: { txHash: string; choice: number; timestamp: string }[] }
```

#### `POST /api/vote`
Request:
```ts
{ wallet: string; proposalId: string; choice: 0 | 1 | 2 }
```
Response:
```ts
{ ok: true; txHash: string; newTally: { yes: number; no: number; abstain: number } }
  | { ok: false; error: 'not_verified' | 'already_voted' | 'proposal_closed' | 'server_error'; message: string }
```

### 7.5 TypeScript types (both use)

Put in `frontend/lib/types.ts`. Team lead creates the file, teammate imports.

```ts
export type ProposalCategory = 'academic' | 'hostel' | 'mess' | 'cultural' | 'general';

export interface Proposal {
  id: string;
  onchainId: string;
  title: string;
  description: string;
  category: ProposalCategory;
  deadline: string;
  creatorWallet: string;
  tallyYes: number;
  tallyNo: number;
  tallyAbstain: number;
  createdAt: string;
}

export interface VerifiedUser {
  wallet: string;
  nullifier: string;
  attestationUid: string;
  attestedAt: string;
}

export const VOTE_CHOICES = { YES: 0, NO: 1, ABSTAIN: 2 } as const;
export type VoteChoice = 0 | 1 | 2;
```

---

## 8. Role A — Team Lead (Lakshay) — Frontend + Design + Pitch + Coordination

### 8.1 Your responsibilities

You own **~65% of the surface area**: everything the judge sees, every pixel, the pitch, the video, and the submission. You also coordinate the teammate.

- **Frontend** (Next.js app, all pages, all UI, wallet connect, contract calls)
- **Design system** (Tailwind + shadcn setup, dark theme, animations)
- **Pitch deck** (Canva or Google Slides, 8–10 slides)
- **Demo video** (Loom or screen recording, 90–120 seconds)
- **Devfolio submission** (write-up, screenshots, video embed)
- **Coordination** (daily check-ins with teammate — see §10)
- **Judge live demo rehearsal** (know your script cold)

### 8.2 Skills to lean on Cursor for

- **Use Composer mode** for multi-file edits (creating a whole page + its components at once).
- **Use `@Codebase` context** when you're wiring pages together — Cursor reads all your files.
- **Never manually write boilerplate** — always prompt Cursor. e.g., "Create a `<ProposalCard>` component that shows title, description snippet, category badge, deadline countdown, and current tally as a mini bar. Use shadcn Card. Tailwind. Match the design of the existing feed page."
- **Reference the PRD explicitly**: "Per PRD §2, feature 4, build the proposal detail page. It must include: [X, Y, Z]."
- **When Cursor produces something wrong, don't accept and edit — reject and re-prompt with more specificity.**

### 8.3 Day-by-day timeline

**Today = Tuesday Aug 18, 2026, ~2:00 PM IST when you start.** Assume you finish at midnight → **~10 hours today**. Then Wed/Thu/Fri/Sat full days. Submission Sat night.

#### Day 0 — Tue Aug 18 (2 PM – midnight, 10h)

| Time | Task | Deliverable |
|---|---|---|
| 2:00 – 2:30 | Read this entire PRD end to end. Then read §7 (interfaces) twice. | You know the plan. |
| 2:30 – 3:00 | Complete §5 setup checklist (Vercel account, fresh GitHub repo `silent-council`, grant teammate access). | Empty repo pushed, teammate invited. |
| 3:00 – 3:15 | Copy `PRD.md`, `PROMPTS.md`, `AGENTS.md`, `.cursorrules` into the fresh repo. Commit `chore: initial docs`. | Repo has docs. |
| 3:15 – 3:30 | Send teammate the repo link + tell him: "read PRD end-to-end, then paste the Antigravity prompt from PROMPTS.md into your IDE." Confirm he starts. | Teammate started. |
| 3:30 – 5:00 | Scaffold Next.js app. Cursor prompt: *"Bootstrap `frontend/` with `npx create-next-app@latest frontend --typescript --tailwind --app --eslint --src-dir=false --import-alias='@/*'`. Add shadcn/ui with `npx shadcn@latest init`. Install wagmi v2, viem, @rainbow-me/rainbowkit, @tanstack/react-query, @supabase/supabase-js, @zk-email/sdk. Create `lib/types.ts` per PRD §7.5. Create `lib/contracts.ts` with a placeholder for the contract address."* | `frontend/` boots on `npm run dev`. |
| 5:00 – 6:00 | Configure wagmi + RainbowKit for Base Sepolia. Create `app/providers.tsx` with WagmiProvider, RainbowKitProvider, QueryClientProvider. Wire into `app/layout.tsx`. | Wallet connect button works. |
| 6:00 – 6:30 | **Deploy the empty scaffold to Vercel.** Push to GitHub, import into Vercel, set placeholder env vars, deploy. This shakes out deploy issues on Day 0, not Day 4. | Live at `silent-council-XXX.vercel.app`. |
| 6:30 – 7:00 | Break. Eat. Do NOT skip. | Alive. |
| 7:00 – 8:30 | Build the landing page. Hero: title, one-line pitch, big "Verify with NITK email" CTA button (dead-link for now), animated stats counter (fake numbers ok — `1,247 verified students, 8 live proposals`). Dark theme. Use gradient. Look at [linear.app](https://linear.app) or [vercel.com](https://vercel.com) for design inspo — tell Cursor. | Landing page shipped. |
| 8:30 – 9:30 | Build the shadcn design system polish — buttons, cards, badges, dialogs all styled. Set up global fonts (Inter or Geist). | Design system in place. |
| 9:30 – 10:30 | Build the empty proposals feed page at `/proposals`. Mock 5 proposals in-memory. Grid of `<ProposalCard>` components. Category filter chips at top. | Feed page renders with mock data. |
| 10:30 – 11:30 | Build the proposal detail page skeleton at `/proposals/[id]`. Header, description, tally chart placeholder, vote buttons (dead-link for now), deadline countdown. | Detail page renders. |
| 11:30 – midnight | Commit everything. Push. Confirm Vercel deploy is green. Send teammate a screenshot of the current state on WhatsApp. Sleep. | Day 0 done. |

**Checkpoint at 6 PM today:** confirm teammate has done §5 setup and created the Supabase project. Ask him for the Supabase URL + anon key by 8 PM so you can wire them tomorrow.

#### Day 1 — Wed Aug 19 (10h)

**Priority: verification flow end-to-end + wire the contract.**

| Time | Task |
|---|---|
| 9:00 – 9:30 | Morning check-in with teammate on WhatsApp. Confirm he has: (a) Solidity contract skeleton written, (b) Supabase URL + anon key sent to you, (c) EAS schema UID sent to you. If any missing, escalate. |
| 9:30 – 11:00 | Build `/verify` page. UI: Step 1: Connect wallet. Step 2: Click "Verify Email" → opens a modal that walks user through: "Send yourself a Gmail verification email → forward to zk.email prover." (Wait for teammate's `/api/attest` endpoint before wiring — mock in the meantime.) |
| 11:00 – 12:00 | Wire wagmi `useReadContract` hook to `isVerified(address)` — displays green ✓ badge in the top nav if user is verified. |
| 12:00 – 13:00 | Lunch. |
| 13:00 – 14:30 | **Cursor prompt:** *"Create a `<TallyChart>` component that takes `{yes, no, abstain}` numbers and shows an animated horizontal stacked bar. Use Recharts or plain SVG with Framer Motion. Percentages labeled inline. Green/red/gray."* Add to proposal detail page. |
| 14:30 – 16:00 | Build create-proposal flow at `/proposals/new`. Form: title, description (textarea, markdown supported), category dropdown, deadline (date picker). Submit → calls teammate's `POST /api/proposals`. |
| 16:00 – 17:00 | Wire real Supabase reads: replace mock proposals with `supabase.from('proposals').select('*')` in the feed page. Use React Query for caching. |
| 17:00 – 18:00 | Wire the Realtime subscription for live tally updates on proposal detail page: `supabase.channel('proposals').on('postgres_changes', ...)`. |
| 18:00 – 18:30 | Break. |
| 18:30 – 20:00 | **Test end-to-end with teammate.** Have him call `/api/proposals POST` from a curl command. Verify a proposal appears in your feed within 2s (Realtime). Fix any interface mismatches. |
| 20:00 – 21:00 | Add "My Dashboard" page at `/dashboard` showing user's attestation, proposals they've voted on. |
| 21:00 – 22:00 | Polish landing page hero + copy. Add real testimonial quotes (make them up but attribute to plausible NITK personas). |
| 22:00 – 23:00 | Deploy latest to Vercel. Test on your phone. Fix mobile responsive bugs. |
| 23:00 – midnight | Send teammate a status update. Note any blockers. Sleep. |

**Checkpoint at noon:** teammate should have the contract deployed. Ask for the address. If not deployed, that's a red flag — push him hard, and start thinking about the "no contract, Supabase-only" fallback.

**Checkpoint at 6 PM:** `/api/proposals POST` and `/api/attest POST` should both work end-to-end. If they don't, teammate is behind — you help him after 10 PM.

#### Day 2 — Thu Aug 20 (10h)

**Priority: voting works fully, seed data loaded, polish everything.**

| Time | Task |
|---|---|
| 9:00 – 9:30 | Check-in. Confirm teammate has `/api/vote` working. |
| 9:30 – 11:30 | Wire vote buttons on proposal detail page: click YES → shows confirm modal → calls `/api/vote` → shows tx hash → success toast. Handle error states (already voted, not verified, closed). |
| 11:30 – 12:30 | Add "🔴 LIVE" badge and pulsing dot to proposals with deadlines in the next 24h. Countdown timer. |
| 12:30 – 13:30 | Lunch. |
| 13:30 – 15:00 | Build `/verifiability` page. Explain how the ZK proof works, in plain English + one diagram. Link out to contract on Basescan, EAS schema on EASscan, zk.email docs, this GitHub repo. |
| 15:00 – 16:30 | Build the "sybil counter" widget on landing page: `supabase.from('sybil_attempts').select('*', { count: 'exact' })`. Shows something like "🛡️ 12 double-vote attempts blocked." |
| 16:30 – 17:30 | Add 5 seed proposals (via teammate's API from the browser or a script). Realistic titles like "Extend mess hours to 11pm?" |
| 17:30 – 18:30 | Break + walk. |
| 18:30 – 20:00 | Animation polish: hover states on cards, Framer Motion page transitions, success confetti on vote (canvas-confetti package). |
| 20:00 – 21:30 | Mobile responsiveness pass. Test in Chrome mobile emulator + real phone. Fix all overflow issues. |
| 21:30 – 22:30 | Deploy. Fix any prod-only bugs. |
| 22:30 – midnight | Draft the pitch deck outline in Canva (8 slides). Don't design yet, just outline. Sleep. |

#### Day 3 — Fri Aug 21 (10h)

**Priority: pitch, demo video, submission draft.**

| Time | Task |
|---|---|
| 9:00 – 10:30 | Design pitch deck in Canva. 8 slides: (1) Problem, (2) Solution, (3) Live product, (4) How it works (diagram), (5) Why Ethereum, (6) Demo screenshots, (7) What's next (roadmap), (8) Team + thanks. |
| 10:30 – 11:30 | Rehearse pitch out loud with your teammate on video call. Time it. Aim for 2 minutes. Cut anything that's not landing. |
| 11:30 – 13:00 | Record demo video (Loom preferred — auto-uploads, easy share link). Script it: (a) Land on landing page, (b) Connect wallet, (c) Verify email (pre-warm the proof so it's instant on camera), (d) Browse proposals, (e) Vote on one, (f) Watch tally update, (g) Try to double-vote — rejected. 90 seconds. |
| 13:00 – 14:00 | Lunch. |
| 14:00 – 15:30 | Re-record demo video 2 more times, pick the best take. Trim in iMovie/QuickTime. Upload to YouTube unlisted or Loom. |
| 15:30 – 17:00 | Write Devfolio submission text. Sections: Inspiration, What it does, How we built it, Challenges, Accomplishments, What's next. Reference PRD's pitch section (§1) — do not write from scratch. |
| 17:00 – 18:00 | Take 4–6 screenshots at 1920×1080 for Devfolio. Landing, verify, feed, detail, vote confirmation, dashboard. |
| 18:00 – 18:30 | Break. |
| 18:30 – 20:00 | Cross-browser test: Chrome, Safari, Firefox, mobile Safari. Fix breakages. |
| 20:00 – 21:30 | **Bug bash with teammate.** Both of you try to break the app. Every bug → fix immediately or file a note. |
| 21:30 – 23:00 | Fix bugs. Deploy. |
| 23:00 – midnight | Final draft of Devfolio submission ready to submit tomorrow. Sleep. |

#### Day 4 — Sat Aug 22 (10h)

**Priority: SUBMIT + polish + rehearse.**

| Time | Task |
|---|---|
| 9:00 – 10:00 | Final smoke test in prod. Verify a fresh Google account works end-to-end. |
| 10:00 – 12:00 | Any last polish + copy fixes. |
| 12:00 – 13:00 | Lunch. |
| 13:00 – 15:00 | Write the public README.md — clean, professional, judge-friendly. Includes: pitch, screenshots, video embed, tech stack, credits (zk.email, EAS, Base, and honestly credit `Shivannsh/ZKAttestify-Sp1-verifier` if you kept any SP1 code). |
| 15:00 – 16:00 | Deploy final. Tag release `v1.0.0`. |
| 16:00 – 17:00 | Submit on Devfolio. Include video, screenshots, GitHub link, live URL. |
| 17:00 – 19:00 | Rehearse the live pitch 5 more times. Time yourself. Have your teammate quiz you on possible judge questions. |
| 19:00 – 20:00 | Break. |
| 20:00 – 22:00 | **Buffer.** For inevitable last-minute bugs. If none, celebrate. |
| 22:00 | Confirm submission is in. Take a screenshot of the "submitted" confirmation. Post it in the team WhatsApp. |

### 8.4 What you DELIVER to teammate — and when

| When | Deliverable to teammate | How |
|---|---|---|
| Tue 3:15 PM | GitHub repo `silent-council` + write access | GitHub invite email |
| Tue 4:00 PM | `frontend/lib/types.ts` with all shared TypeScript types | Pushed to main |
| Tue 6:30 PM | Vercel deployment URL (for testing his API routes from browser) | WhatsApp |
| Wed 3:00 PM | `frontend/app/api/` folders created with stub route files (so his edits don't conflict) | Pushed to main |
| Wed 10:00 PM | Working feed + detail pages that consume his APIs (so he can see visible feedback of his work) | Deployed |

### 8.5 What you EXPECT from teammate — and when

| When | Deliverable from teammate | If missing, do this |
|---|---|---|
| Tue 6:00 PM | Supabase project URL + anon key + service role key | Ping him, offer to pair-program the setup over screen share |
| Tue 9:00 PM | Supabase schema created per §7.2, tables visible in Supabase Studio | Send him the SQL from §7.2, tell him to paste and run |
| Wed 10:00 AM | `SilentCouncil.sol` contract file in `contracts/` folder | Ask for status; if stuck, help debug via screen share |
| Wed 2:00 PM | Contract deployed to Base Sepolia, address shared | If not, help him deploy via Remix live |
| Wed 4:00 PM | EAS schema UID for the "verified NITK student" attestation | If not, do it yourself via [base-sepolia.easscan.org/schema/create](https://base-sepolia.easscan.org/schema/create) |
| Wed 8:00 PM | Working `POST /api/attest` endpoint | Test it with curl, work with him to debug |
| Thu 12:00 PM | Working `POST /api/vote` and `POST /api/proposals` endpoints | Test, debug together |
| Thu 6:00 PM | End-to-end verify → vote flow working in dev | Fallback: if zk.email fails, use email OTP-based verification (see §13) |

### 8.6 When you're blocked

- **Cursor Composer is giving garbage code:** rephrase with more constraints. Add "Do NOT do X" clauses.
- **wagmi hook not firing:** ensure `WagmiProvider` wraps everything. Ensure chain is Base Sepolia. Check RPC URL in `.env.local`.
- **Vercel build failing:** read the exact error, paste into Cursor. 90% of the time it's a missing env var or `NEXT_PUBLIC_` prefix mistake.
- **Teammate ghosting:** by 8 PM the day it's due, escalate — call him. If truly stuck, YOU take over the backend and ship a JavaScript-only "verified" flow (email OTP fallback in §13.2).

---

## 9. Role B — Teammate — Contracts + Backend + Integration

**Copy §9 into Antigravity as your project brief (see PROMPTS.md for the exact prompt).**

### 9.1 Your responsibilities

You own **~35% of the surface area**, but it's the *critical path*: nothing works until your contract + APIs are ready. You are the backbone.

- **Smart contract** (`SilentCouncil.sol`, deployed to Base Sepolia via Remix)
- **EAS schema** (create via [base-sepolia.easscan.org/schema/create](https://base-sepolia.easscan.org/schema/create))
- **Supabase project + schema + Realtime**
- **Next.js API routes** in `frontend/app/api/` (verify, attest, proposals, vote)
- **zk.email SDK integration** (in the API routes)
- **Issuer signing logic** (in `/api/attest`)
- **Documentation** (`contracts/DEPLOYMENT.md`)

### 9.2 Skills to lean on Antigravity for

- **Use Planning Mode aggressively.** Before you write code, ask Antigravity to output an implementation plan. Review, tweak, then approve.
- **Reference this PRD explicitly.** *"Per PRD §7.3, implement the ISilentCouncil interface. Include natspec comments. Use OpenZeppelin's ECDSA for signature recovery."*
- **Use `@` file references** in Antigravity to pull in the PRD/AGENTS.md automatically.
- **Test as you go.** After each API route, curl it from your terminal, verify the response shape matches §7.4.
- **AGENTS.md is already set up.** Antigravity reads it on startup; you don't need to re-explain rules.

### 9.3 Day-by-day timeline

#### Day 0 — Tue Aug 18 (2 PM – midnight, 10h)

| Time | Task | Deliverable |
|---|---|---|
| 2:00 – 3:00 | Read this entire PRD. Then read §7 (interfaces) three times — it's your contract with team lead. | Understand plan. |
| 3:00 – 3:30 | Accept GitHub invite, clone the repo. Read the `PROMPTS.md` file, copy your Antigravity bootstrap prompt, paste into Antigravity as first message. | Antigravity is bootstrapped. |
| 3:30 – 4:00 | Complete §5 setup — MetaMask + Base Sepolia + faucet ETH + Supabase account. | Prereqs done. |
| 4:00 – 5:00 | Create Supabase project `silent-council`. Run the SQL from §7.2 in Supabase SQL editor. Enable Realtime on `votes` and `proposals` tables (Database → Replication). Copy URL + anon key + service role key. | Supabase live. |
| 5:00 – 5:15 | Send URL + anon key + service role key to team lead via secure channel (Notion, 1Password, or DM — NOT WhatsApp). | TL unblocked. |
| 5:15 – 6:00 | In Antigravity, prompt: *"Draft `contracts/SilentCouncil.sol` per PRD §7.3 (ISilentCouncil interface). Use OpenZeppelin ECDSA for signature verification. Add natspec comments. Include events per interface. Solidity 0.8.20. MIT license."* Review Antigravity's plan, approve, generate. | Contract file drafted. |
| 6:00 – 6:30 | Break + food. | Alive. |
| 6:30 – 8:00 | Copy the contract into [Remix IDE](https://remix.ethereum.org). Compile with Solidity 0.8.20. Fix any compiler errors (paste them back to Antigravity). | Contract compiles. |
| 8:00 – 9:00 | Deploy to Base Sepolia via Remix + MetaMask (Injected Provider). Deployer wallet = your Base Sepolia wallet. Save the address. | Contract deployed. |
| 9:00 – 10:00 | Update `frontend/lib/contracts.ts` with the address and ABI (Remix → Compilation Details → ABI copy). Commit + push. Tell team lead. | Address shared. |
| 10:00 – 11:00 | Go to [base-sepolia.easscan.org/schema/create](https://base-sepolia.easscan.org/schema/create). Create schema: `address wallet, string domain, bytes32 nullifier`. Set revocable=true. Save the UID. | EAS schema live. |
| 11:00 – midnight | Update `.env.example` with EAS schema UID. Send to team lead. Sleep. | Day 0 done. |

**If you're behind at 9 PM (no contract deployed), ping team lead immediately.**

#### Day 1 — Wed Aug 19 (10h)

| Time | Task |
|---|---|
| 9:00 – 9:30 | Morning check-in with team lead on WhatsApp. Sync on any blockers. |
| 9:30 – 11:30 | Study `@zk-email/sdk` docs at [docs.zk.email/zk-email-sdk](https://docs.zk.email/zk-email-sdk/). Find or create a Gmail-based blueprint that extracts the `From` field and asserts it ends in `@nitk.edu.in`. Reuse an existing blueprint if you can (search the [zk.email registry](https://registry.zk.email)); create your own only if none fit. |
| 11:30 – 13:00 | Prompt Antigravity: *"In `frontend/app/api/attest/route.ts`, implement POST per PRD §7.4. Steps: (1) parse request body per PRD §7.4, (2) call `@zk-email/sdk` to verify the proof + public inputs, (3) extract the email from public inputs, (4) verify domain ends with `nitk.edu.in`, (5) compute nullifier = keccak256(email + DOMAIN_SALT), (6) check if wallet is already verified (query Supabase `verified_users`), (7) sign `{wallet, nullifier}` with ISSUER_PRIVATE_KEY using viem's `signMessage`, (8) call SilentCouncil.verifyVoter(wallet, nullifier, sig) using viem walletClient, (9) insert into Supabase `verified_users`, (10) return response per §7.4."* Review plan, execute. |
| 13:00 – 14:00 | Lunch. |
| 14:00 – 16:00 | Test `/api/attest` locally with a real Google email. Debug. |
| 16:00 – 18:00 | Implement `/api/proposals` GET + POST per §7.4. GET reads from Supabase, POST calls `SilentCouncil.createProposal` via viem then inserts into Supabase. |
| 18:00 – 18:30 | Break. |
| 18:30 – 20:30 | Implement `/api/vote` POST per §7.4. Look up nullifier from `verified_users`, sign `{proposalId, nullifier, choice}` with issuer key, call `SilentCouncil.vote(...)`, on success insert into Supabase `votes` and increment the tally on `proposals` row (which triggers Realtime to frontend). |
| 20:30 – 22:00 | End-to-end test with team lead. He tries to verify, vote, browse. Fix bugs. |
| 22:00 – midnight | Write `contracts/DEPLOYMENT.md`: contract address, ABI, deployment instructions, EAS schema UID, chain info. Sleep. |

#### Day 2 — Thu Aug 20 (10h)

| Time | Task |
|---|---|
| 9:00 – 10:00 | Check-in. Priority items from team lead. |
| 10:00 – 12:00 | Implement `/api/proposals/:id` GET. Includes recent votes list (from Supabase, no PII). |
| 12:00 – 13:00 | Lunch. |
| 13:00 – 15:00 | Log sybil attempts. In every rejection path (already voted, invalid proof, wrong domain) insert a row into `sybil_attempts`. |
| 15:00 – 17:00 | Load test: create 20 proposals via script, cast 100 fake votes (using multiple test wallets with mocked verification). Ensure UI stays fast. |
| 17:00 – 18:00 | Break. |
| 18:00 – 20:00 | Bug bash — try to break your own APIs. Fix everything. |
| 20:00 – 22:00 | Second-pass code review with Antigravity: *"Review all files in `frontend/app/api/` for security issues, missing validation, error handling, and race conditions. Suggest fixes."* Apply. |
| 22:00 – midnight | Write API integration docs in `contracts/DEPLOYMENT.md`. Sleep. |

#### Day 3 — Fri Aug 21 (10h)

| Time | Task |
|---|---|
| 9:00 – 10:00 | Check-in. |
| 10:00 – 13:00 | **Support team lead.** Help him wire the frontend to your APIs. Fix any interface mismatches. |
| 13:00 – 14:00 | Lunch. |
| 14:00 – 17:00 | **Fallback prep** (see §13). Implement an email-OTP fallback (`/api/verify-otp`) in case zk.email fails on demo day. Off-by-default; toggled by env var. |
| 17:00 – 18:00 | Break. |
| 18:00 – 21:00 | Contract Etherscan verification. Go to [Basescan Sepolia](https://sepolia.basescan.org), find your contract, click "Verify & Publish," paste flattened source. Gives you a green ✓ on Basescan — huge credibility for judges. |
| 21:00 – midnight | Bug fixes + rest. |

#### Day 4 — Sat Aug 22 (10h)

| Time | Task |
|---|---|
| 9:00 – 12:00 | Help team lead with final polish + testing. |
| 12:00 – 13:00 | Lunch. |
| 13:00 – 16:00 | Buffer for any last bugs. |
| 16:00 – 19:00 | Support Devfolio submission with technical description. Provide the contract address and EAS schema UID for the submission text. |
| 19:00 – 22:00 | Rehearse the technical Q&A. Anticipate judge questions: "How do you prevent sybil?" "What's the trust model?" "Why Base Sepolia?" Have crisp answers. |

### 9.4 What you DELIVER to team lead — and when

| When | Deliverable | How |
|---|---|---|
| Tue 5:15 PM | Supabase URL + anon key + service role key | Notion / 1Password |
| Tue 9:00 PM | Contract deployed on Base Sepolia + address + ABI in `frontend/lib/contracts.ts` | Commit + push + WhatsApp ping |
| Tue 11:00 PM | EAS schema UID | `.env.example` update + WhatsApp |
| Wed 1:00 PM | Working `POST /api/attest` in prod (Vercel) | Deploy + test link |
| Wed 6:00 PM | Working `POST /api/proposals` and `GET /api/proposals` | Deploy |
| Wed 8:30 PM | Working `POST /api/vote` | Deploy |
| Thu 12:00 PM | `GET /api/proposals/:id` with tally | Deploy |
| Thu 6:00 PM | All endpoints stable, sybil logging live | Deploy |
| Fri 6:00 PM | Contract Etherscan-verified (green ✓ on Basescan) | Basescan link |
| Fri 10:00 PM | `contracts/DEPLOYMENT.md` complete | Commit + push |

### 9.5 What you EXPECT from team lead — and when

| When | Deliverable | If missing, do this |
|---|---|---|
| Tue 3:15 PM | GitHub repo access | Ping him |
| Tue 4:00 PM | `frontend/lib/types.ts` per §7.5 | Write it yourself if he's late; TL doesn't own the ABI, but the types are handy |
| Tue 6:30 PM | Vercel deployment URL | Ping |
| Wed 3:00 PM | `frontend/app/api/` folder scaffold with empty route files | Create yourself |
| Wed 10:00 PM | Frontend pages consuming your APIs — visible feedback on Vercel | Test your APIs via Postman if not |

### 9.6 When you're blocked

- **Solidity compile error:** paste error into Antigravity with the code. It'll fix.
- **Remix deploy fails "insufficient funds":** get more faucet ETH.
- **zk.email SDK proof generation timing out:** switch `isLocal: false` in `createProver` config to use hosted proving.
- **Supabase Realtime not firing:** confirm Realtime is enabled per-table in Supabase dashboard (Database → Replication).
- **API route works locally, fails on Vercel:** 95% of the time it's a missing env var. Check Vercel dashboard → Settings → Environment Variables.
- **Anything else broken for >45 min:** ping team lead, screen share.

---

## 10. Daily Sync Checkpoints (Team Lead's Monitoring Schedule)

You (team lead) run standups at these fixed times. Send a WhatsApp voice note or text with three questions:
1. What did you finish since last check-in?
2. What are you working on now?
3. Any blockers?

| Day | Time | What to verify |
|---|---|---|
| Tue | 4:00 PM | Teammate did §5 setup, Supabase project created |
| Tue | 8:00 PM | Supabase schema deployed, Solidity contract drafted |
| Tue | 11:00 PM | Contract deployed to Base Sepolia, EAS schema UID exists |
| Wed | 10:00 AM | Morning standup — plan the day |
| Wed | 2:00 PM | `/api/attest` skeleton in place |
| Wed | 6:00 PM | `/api/attest` and `/api/proposals` working locally |
| Wed | 10:00 PM | End-of-day standup — end-to-end verify works |
| Thu | 10:00 AM | Morning standup |
| Thu | 3:00 PM | `/api/vote` working, sybil check confirmed |
| Thu | 8:00 PM | Everything on Vercel prod |
| Fri | 10:00 AM | Bug bash starts |
| Fri | 6:00 PM | Etherscan verified |
| Fri | 10:00 PM | Fallback flows tested |
| Sat | 10:00 AM | Final smoke test |
| Sat | 6:00 PM | Submission ready |
| Sat | 10:00 PM | **SUBMITTED** on Devfolio |

**Rule:** If a checkpoint is missed by >2 hours without escalation, one of you calls the other on the phone. No exceptions. Silent failure is the #1 killer of hackathon teams.

---

## 11. Demo Script (90 seconds — memorize)

**[00:00]** "Every Indian college has a rigged, doxxable, or ignored voting system. WhatsApp polls leak identity. Paper ballots get lost. Nobody trusts it, nobody votes. We built the fix."

**[00:15]** "Silent Council. Verified NITK students only, secret ballots, tallies on Ethereum. Watch."

**[00:20]** *(click Verify)* "I connect my wallet. I click Verify. Behind the scenes, my Gmail sends a DKIM-signed message, a zero-knowledge proof asserts I own an @nitk.edu.in email — my actual email never leaves my browser."

**[00:40]** *(attestation issued)* "Boom, an onchain attestation on Base Sepolia. You can verify this on EASscan right now. It says: 'this wallet controls a real NITK email' — but my email is nowhere in the proof."

**[00:55]** *(open proposal)* "Here's a real proposal: 'Extend mess hours to 11 PM.' I vote Yes. Transaction goes to our contract on Base."

**[01:15]** *(tally updates live)* "Tally updates in real time via Ethereum event streaming. Every vote is auditable on Basescan — the count is the count, nobody can fake it."

**[01:25]** *(try to vote again)* "I try to vote again — rejected. The contract uses a cryptographic nullifier bound to my email; one email, one vote, forever. Even if I mint a new wallet."

**[01:40]** "Real democracy for Indian colleges. Ready for the next NITK election. GitHub link in the submission. Thanks."

**[01:50]** END.

---

## 12. Devfolio Submission Checklist (Sat 5 PM)

- [ ] **Title:** Silent Council — Verified Anonymous Voting for NITK
- [ ] **Tagline (100 chars):** Onchain student democracy where votes are secret, voters are verified, tallies are public.
- [ ] **Description** — 3 paragraphs, use §1 pitch as source
- [ ] **Video** — 90–120s, YouTube unlisted or Loom
- [ ] **Screenshots** — 4–6 at 1920×1080: landing, verify, feed, detail, vote confirm, dashboard
- [ ] **GitHub link** — public repo, clean README
- [ ] **Live link** — `silentcouncil.xyz` or Vercel URL
- [ ] **Tech stack tags** — Ethereum, Base, Solidity, zk.email, EAS, Next.js, TypeScript
- [ ] **Team members** — both of you added
- [ ] **Track** — pick the one matching "Private Apps using Ethereum"

---

## 13. Fallback Plans (When Things Break On Demo Day)

### 13.1 zk.email proof gen takes >2 minutes on demo day

**Fallback:** pre-generate 3 proofs for 3 dummy Google accounts *before* judging. Cache them. During live demo, if judge's proof gen takes too long, seamlessly switch to a cached "prep account" — mention "we cached this proof for demo speed."

### 13.2 zk.email SDK completely broken / down

**Fallback:** enable the email-OTP fallback (teammate builds Day 3). Flow: user enters `@nitk.edu.in` email, we email them a 6-digit code, they enter it, we compute nullifier = `hash(email + salt)` on our backend, sign attestation. **NOT zero-knowledge** — we see the email server-side. Pitch honestly: *"MVP falls back to email OTP if the ZK prover is down; production would use only the ZK path."*

### 13.3 Base Sepolia RPC down / congested

**Fallback:** switch to a paid RPC (Alchemy free tier) in env var, redeploy Vercel. Takes 10 min.

### 13.4 Vercel deployment breaks last minute

**Fallback:** run `npm run dev` on your laptop, expose via [ngrok](https://ngrok.com) or Cloudflare Tunnel. Demo works from your laptop live. Have this pre-tested Friday.

### 13.5 Contract has a bug we can't fix live

**Fallback:** redeploy patched version, update `NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS`. Have Remix + wallet ready during demo.

### 13.6 Teammate ghosts you Day 3

**Fallback:** you take over backend. Skip smart contract entirely — store votes in Supabase with server-signed nullifiers. Frontend still shows "onchain" language; add the contract post-hackathon. Lose some technical credibility, keep the product.

### 13.7 You (team lead) get sick

Teammate takes over frontend polish. He has AGENTS.md, PRD, and can vibecode with Antigravity. Fallback is functional if not gorgeous.

---

## 14. Names & Branding (Team Lead picks by end of Day 0)

- **Silent Council** (current working name — serious, dignified)
- **shhVote** (playful)
- **Kaakraadhi** (Kannada for "vote," localized)
- **BallotBox**
- **AnonVote** (too generic)
- **Verified Silent**
- **Pardah** (Hindi for "curtain/veil"; culturally rooted)

**My pick:** **Silent Council.** Serious enough for faculty, evocative enough to remember.

**Domain suggestions (if buying):** `silentcouncil.xyz`, `silentcouncil.app`, `silent.vote`.

**Logo:** open Canva → search "ballot" or "shield" → pick one → recolor to match Tailwind indigo/violet. Don't spend >30 min on this.

---

## 15. How to Use This PRD in Your AI IDE

### Cursor (Team Lead)

1. Copy `.cursorrules` (see `PROMPTS.md`) into your `frontend/` root.
2. When prompting, reference the PRD with `@PRD.md` — Cursor reads it.
3. For multi-file tasks, use **Composer** (Cmd+I).
4. First prompt each day: paste the daily kickoff prompt from `PROMPTS.md`.

### Antigravity (Teammate)

1. Copy `AGENTS.md` into workspace root (already provided).
2. First-message prompt: copy the "Antigravity bootstrap" section from `PROMPTS.md`.
3. Always start complex tasks in **Planning Mode**.
4. Reference the PRD with `@PRD.md` in prompts.
5. Approve plans quickly — don't over-review. Trust the plan, review the diff.

---

## 16. Final Rules of Engagement

1. **The PRD is the source of truth.** If reality diverges, update the PRD in a commit.
2. **No feature creep after Day 2.** New ideas go to a `FUTURE.md` file, not into the sprint.
3. **Deploy every day.** If it's not on Vercel, it doesn't exist.
4. **Test on a phone every day.** Judges use phones.
5. **Commit every 90 minutes minimum.** Small commits, clear messages.
6. **Sleep 7 hours minimum every night.** Sleepy hackers ship broken products.
7. **Eat real meals.** Not just Maggi.
8. **When you disagree, defer to the PRD.** When PRD is ambiguous, team lead decides.
9. **Have fun.** If you both hate it by Wednesday, we're building the wrong thing. Say something.

---

**Now go build. Ship on Aug 22. Win.**

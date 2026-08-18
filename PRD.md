# Silent Council — Product Requirements Document (PRD)

> **The first fully onchain, verified-but-anonymous voting system for NITK.**
> Real students, secret ballots, public tallies. No rigging, no retaliation, no low-turnout excuses.

**Hackathon:** [Road to Devcon — NITK Surathkal](https://road-to-devcon-nitk-surathkal.devfolio.co/overview) (Aug 17–23, 2026)
**Theme:** Make Private Apps using Ethereum
**Team size:** 2 (Team Lead + Contract/Backend Engineer)
**Deliverable deadline:** Saturday **Aug 22, 2026, ~5 PM IST** (submit) — Sun Aug 23 is judging only
**Time budget (be honest):** ~4 hours/day Tue–Fri + ~10 hours Sat. Total ≈ 26h each, ≈ 52h combined. **This is a "cut everything non-essential" build.**

---

## 0. TL;DR

Anyone at NITK can create a proposal ("Should mess timings be extended?"). Verified NITK students prove they own an `@nitk.edu.in` email via a zero-knowledge proof (`zk.email`) — get an onchain attestation (EAS on Base Sepolia) — then vote anonymously. Their vote is recorded on a smart contract with a nullifier so they can't vote twice, but nobody (not even us) can tell who they are or what they voted.

Judges see a live demo where they sign in with a real Google account, cast a vote, watch the tally update in real time, and try to double-vote and get rejected. 90 seconds. Mic drop.

> **Scope reality (Aug 18 rewrite):** We have ~4h/day Tue–Fri and ~10h Sat. That's it. We are building the demo loop only — landing, verify, one proposal page, vote, double-vote rejection. Everything else (dashboard, sybil counter, animations, pitch page, seed 20 proposals, ranked-choice, Etherscan verify, custom domain) is **CUT unless we're ahead of schedule by Fri 6 PM**.

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

### MUST SHIP (the 90-second demo loop — non-negotiable)

1. **Landing page** — hero + one-line pitch + "Verify with NITK email" CTA + 3 hardcoded proposal cards below. Dark theme. Mobile works. **Zero animation, zero fake stat counters, zero live sybil widget.** Ship it ugly first.
2. **Verification flow** — wallet connect → click "Verify" → ZK email proof (or OTP fallback per §13.2) → backend signs → contract stores nullifier → green ✓ badge. One page (`/verify`), one modal.
3. **Proposal detail page** — one route `/proposals/[id]`. Title, description, Yes/No/Abstain buttons, tally shown as three coloured bars with counts. That's it.
4. **Cast vote** — click button → wallet signs tx → contract checks nullifier → tally increments → toast confirms. Double-vote gets rejected with a clear message.
5. **Seed data** — 3 pre-created proposals inserted via SQL directly on Wed (no create-proposal UI needed). Titles like "Extend mess hours to 11pm?", "Ban plastic bottles in hostels?", "Longer library hours during exams?".
6. **Mobile responsive** — judges use phones.

That's the entire product. Verify → open proposal → vote → try again → rejected. **Six items. Do only these until Sat morning.**

### SHOULD SHIP (only if the demo loop is fully working by Fri 6 PM)

7. **Proposals feed page** at `/proposals` — grid of cards. If the demo loop works, add this Fri evening.
8. **Create proposal UI** at `/proposals/new` — form calling `POST /api/proposals`. Fri evening at earliest.
9. **Live tally updates via Supabase Realtime** (currently manual refresh works fine for demo).
10. **Sybil counter widget** on landing — nice narrative, ~30 min to add if data is already being logged.

### CUT unless a miracle happens (do NOT build)

- ❌ `/dashboard` (your own attestation view) — not in demo script
- ❌ `/verifiability` page — link to a doc from footer instead
- ❌ `/pitch` route — the pitch lives in README + Canva deck, not in the app
- ❌ Animated stat counters, Framer Motion page transitions, canvas-confetti — pure fluff
- ❌ Recharts / D3 tally chart — three CSS bars work fine
- ❌ Category filters, search, deadline countdown widget
- ❌ Turnout percentage stat
- ❌ Etherscan / Basescan contract verification — link to raw source in repo instead
- ❌ Custom domain (`silentcouncil.xyz`) — use the `*.vercel.app` URL
- ❌ Ranked-choice, comments, delegation
- ❌ SP1 DOB integration
- ❌ Load testing, animation polish, glassmorphism

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

## 5. Prerequisites & Account Setup (~30 min total — finish TODAY, Aug 18)

### Both of you (~15 min)

- [ ] **GitHub account** (free)
- [ ] **Node.js 20+ installed** — `node -v`
- [ ] **MetaMask** installed → add Base Sepolia via [chainlist.org](https://chainlist.org) → hit an [Alchemy Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia), get ~0.05 test ETH. **Use a fresh MetaMask account, no real funds on it.**
- [ ] **Shared Notion page** for pasting URLs/keys. NOT WhatsApp. Keys never leave that page.

### Team Lead (Lakshay) — ~10 min

- [ ] **Vercel account** (sign in with GitHub, free — Hobby plan is fine, hackathons are non-commercial)
- [ ] **Fresh GitHub repo** `silent-council` (public, empty). Invite teammate as collaborator.
- [ ] **Skip the custom domain.** `*.vercel.app` is fine for judges.

### Teammate — ~10 min

- [ ] **Antigravity installed**, Gemini selected
- [ ] **Supabase account** at [supabase.com](https://supabase.com) → new project `silent-council` (free tier). Copy `URL`, `anon key`, `service_role key` from Project Settings → API into the shared Notion.
- [ ] **Create a SECOND MetaMask account** in the same wallet, name it "Issuer." Export its private key → paste into shared Notion. **This account must never touch mainnet.**

**If setup slips past tonight, Wednesday's 4 hours get burned on setup instead of building. Do it now.**

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

### 8.3 Day-by-day timeline — 4h weekdays + 10h Sat (~26h total)

**Rule: if a block runs over by more than 30 min, cut the next optional item, not sleep.** Missing sleep kills Sat. Missing polish just means the demo isn't glossy.

#### Day 0 — Tue Aug 18 (~4h, starting ~1 PM)

Goal: **empty-but-live app on Vercel + wallet connect + landing page skeleton.** Nothing else.

| Time | Task |
|---|---|
| 1:00 – 1:20 | Read §0, §2, §7, §8, §11. Skip the rest. |
| 1:20 – 1:40 | §5 setup: Vercel, fresh `silent-council` repo, teammate invited. Copy this PRD + `AGENTS.md` + `PROMPTS.md` + `QUICKSTART.md` in. First commit. |
| 1:40 – 1:50 | Ping teammate the QUICKSTART message from `QUICKSTART.md`. He starts §5 + §9 Day 0 in parallel. |
| 1:50 – 3:30 | In Cursor: paste PROMPTS.md → "Step 2 — Day 0 kickoff" prompt. Let it scaffold `frontend/`, install deps, set up shadcn, create `lib/types.ts` + `lib/contracts.ts` + `lib/supabase.ts` + wagmi providers. Do NOT install framer-motion / canvas-confetti / recharts — they're cut. |
| 3:30 – 4:15 | Landing page: dark hero, title, subtitle, "Verify with NITK email" CTA (dead-link to `/verify`), 3 hardcoded `<ProposalCard>`s below. No animated counters, no stats. Should look decent, not amazing. |
| 4:15 – 4:45 | Push → Vercel import → deploy. Paste placeholder env vars. Confirm URL loads. Share URL in team Notion. |
| 4:45 – 5:00 | Commit everything. Message teammate: what you shipped, what you need from him tomorrow. Close laptop. |

**Checkpoint tonight (whenever teammate finishes):** he must send you Supabase URL + anon key + service role key, plus the deployed contract address (or at least a stub deployed with placeholder functions). If those aren't in Notion by end of Tue, Wed's plan changes.

#### Day 1 — Wed Aug 19 (~4h)

Goal: **proposal detail page renders real data from Supabase. Vote button exists but is dead.**

| Time | Task |
|---|---|
| 0:15 | Check Notion: Supabase creds + contract address + EAS schema UID. If any missing, ping teammate NOW. |
| 0:30 | Update `.env.local` and Vercel env vars with real values. Redeploy. |
| 0:45 | Paste contract ABI (from teammate's Remix export) into `lib/contracts.ts`. |
| 1:15 | Build `<TallyBar>` — three coloured `<div>`s with `width: X%`. No Recharts, no Framer. Green/red/gray, count labels inline. |
| 2:15 | Build `/proposals/[id]/page.tsx`: fetches proposal from Supabase, shows title/description, `<TallyBar>`, three buttons (Yes/No/Abstain) that log to console for now. |
| 3:00 | Build `/verify/page.tsx`: connect wallet + big "Verify" button + status text. Wire to teammate's `/api/attest` once it exists — mock the response for now if not. |
| 3:45 | Deploy. Test on your phone. Send teammate a screenshot + tomorrow's asks. |

**If teammate is behind:** stub the contract calls, keep building UI against mock data. Don't wait.

#### Day 2 — Thu Aug 20 (~4h)

Goal: **end-to-end demo loop works in prod.** Vote button → tx → tally increments → second vote rejected.

| Time | Task |
|---|---|
| 0:30 | Wire Yes/No/Abstain buttons to `POST /api/vote`. Show tx hash + success toast (sonner). Handle 3 error states: `already_voted`, `not_verified`, `proposal_closed`. |
| 1:15 | Wire `/verify` to `POST /api/attest` end-to-end. On success, show green ✓ badge in top nav (read `isVerified(address)` from contract via wagmi). |
| 2:00 | Manual QA: connect fresh MetaMask account → verify → open proposal → vote → refresh → try again → should reject. Fix bugs. |
| 3:00 | Mobile pass. Open on your phone. Fix overflow / tap-target issues. |
| 3:45 | Deploy. If anything broke in prod but not local: env vars. Commit + ping teammate. |

**If the demo loop isn't working by end of Thu:** freeze features tomorrow, spend Fri fixing. Do not add anything new.

#### Day 3 — Fri Aug 21 (~4h)

Goal: **demo video + Canva deck + Devfolio draft.** No new features.

| Time | Task |
|---|---|
| 0:45 | Record 90s Loom: land → connect → verify → vote → double-vote-rejected. Pre-verify one account beforehand so the ZK proof doesn't stall on camera. Redo it 2× if needed. |
| 2:00 | Canva deck, 6 slides only: Problem / Solution / How it works (diagram) / Live product screenshots / Why Ethereum / Team + thanks. Don't design; just fill in words + one screenshot per slide. |
| 3:00 | Draft Devfolio write-up in a note file. Steal from §1 pitch verbatim. Take 4 screenshots (landing, verify, proposal, vote confirmation). |
| 3:45 | Push everything to repo. Commit `docs: pitch + demo assets`. Send teammate the draft. |

**If time left:** wire Supabase Realtime subscription (live tally without refresh) OR sybil counter widget. **Only one.**

#### Day 4 — Sat Aug 22 (~10h — SUBMIT DAY)

| Time | Task |
|---|---|
| 10:00 – 11:00 | Smoke test prod end-to-end with a fresh MetaMask + fresh Google account. Fix anything broken. |
| 11:00 – 12:30 | Write public `README.md` — pitch section, screenshots, video embed, tech stack, credits. |
| 12:30 – 13:30 | Lunch. |
| 13:30 – 15:00 | Any last polish: copy fixes, one hover state, one gradient. Nothing structural. |
| 15:00 – 16:30 | Bug bash together with teammate on video call. Both try to break it. Fix P0s only. |
| 16:30 – 17:00 | **SUBMIT on Devfolio.** Video, screenshots, GitHub link, live URL. Take screenshot of confirmation, post in Notion. |
| 17:00 – 18:00 | Break + eat. |
| 18:00 – 19:30 | Rehearse the pitch 5× out loud. Have teammate quiz you: "How do you stop sybil?" "What's the trust model?" "Why Base?" — have crisp 15s answers. |
| 19:30 – 20:30 | Buffer for last bugs. If none, review demo script one more time. |
| 20:30 | Done. Sleep. |

### 8.4 What you DELIVER to teammate — and when

| When | Deliverable | How |
|---|---|---|
| Tue ~1:40 PM | Repo access + docs pushed | GitHub invite |
| Tue ~3:00 PM | `frontend/lib/types.ts` with types per §7.5 + empty `frontend/app/api/{attest,vote,proposals}/route.ts` stubs so his edits don't conflict | Pushed |
| Tue ~4:45 PM | Live Vercel URL for testing his APIs | Notion |
| Wed ~4:00 PM | Frontend that visibly consumes his APIs (so he can see his work) | Deployed |

### 8.5 What you EXPECT from teammate — and when

| When | Deliverable | If missing, do this |
|---|---|---|
| Tue end-of-day | Supabase URL + anon + service_role keys | Screen-share with him for 15 min, click through setup together |
| Tue end-of-day | Contract deployed (even a stub with the right function signatures) + address in `lib/contracts.ts` | If Remix scares him, deploy it yourself. Use his `.sol` file. |
| Tue end-of-day | EAS schema UID (from easscan.org/schema/create) | Create it yourself; takes 3 min |
| Wed end-of-day | `POST /api/attest` returns success for a valid input (mock proof OK) | Wire up the OTP fallback route yourself if needed |
| Thu ~lunch | `POST /api/vote` working against the deployed contract | Same — you have viem knowledge from wagmi work |
| Thu end-of-day | Verify → vote loop working end-to-end in prod | This is the "call teammate on the phone" moment |

### 8.6 When you're blocked

- **Cursor keeps producing garbage:** add "Do NOT" constraints, reference PRD section explicitly, or reject + retry with a smaller scoped ask.
- **wagmi hook not firing:** confirm `WagmiProvider` wraps everything, chain is Base Sepolia (84532), `.env.local` has RPC URL.
- **Vercel build breaks:** 95% of the time = missing env var or missing `NEXT_PUBLIC_` prefix.
- **Teammate ghosts by Thu evening:** escalate to a phone call. If truly gone, you take over `/api/vote` and `/api/attest` yourself; use the OTP fallback (§13.2) since the ZK path is the hard part. Cursor can write those API routes in one prompt.

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

### 9.3 Day-by-day timeline — 4h weekdays + 10h Sat (~26h total)

You are the **critical path**. If you don't ship, team lead is stuck with a pretty UI and nothing behind it. Pace yourself. Follow the click-by-click checklists in `PROMPTS.md`.

#### Day 0 — Tue Aug 18 (~4h)

Goal: **Supabase alive + minimal contract deployed to Base Sepolia + address in the repo.** Don't try to build APIs today.

| Time | Task |
|---|---|
| 0:20 | Read PRD §7, §9, §13. Skip the rest. Accept GitHub invite, clone repo. |
| 0:35 | §5 setup — MetaMask + Base Sepolia + faucet ETH + Supabase account. |
| 1:15 | In Supabase Studio SQL Editor: paste the SQL from §7.2, click Run. Then Database → Replication → toggle Realtime on `votes` and `proposals`. Paste `URL`, `anon key`, `service_role key` from Settings → API into shared Notion. |
| 1:20 | Paste Antigravity bootstrap prompt from PROMPTS.md → have it draft `contracts/SilentCouncil.sol` per §7.3. Approve plan, generate. |
| 2:30 | Open [Remix IDE](https://remix.ethereum.org) → paste contract → Compile with Solidity 0.8.20 (fix errors by pasting them back to Antigravity). Follow the Remix checklist in PROMPTS.md. |
| 3:15 | In Remix: Deploy tab → environment "Injected Provider - MetaMask" → deploy. Sign the MetaMask popup. Copy the deployed address. Paste in Notion. |
| 3:30 | Copy the ABI from Remix (Compilation → click clipboard icon next to ABI). Paste into `frontend/lib/contracts.ts` under `SILENT_COUNCIL_ABI`. Set the address constant. Commit + push. |
| 4:00 | Create the EAS schema at [base-sepolia.easscan.org/schema/create](https://base-sepolia.easscan.org/schema/create): fields `address wallet, string domain, bytes32 nullifier`, revocable=true. Sign MetaMask popup. Paste UID in Notion + `.env.example`. Ping team lead. Done. |

**Stretch (only if fast):** Antigravity can start drafting `frontend/app/api/attest/route.ts` in the background so tomorrow starts warmer.

**If you're behind at ~3h:** ship whatever you have of the contract (even without ECDSA logic — hardcode success paths), get *something* on Base Sepolia so team lead can see an address. Perfect it Wednesday.

#### Day 1 — Wed Aug 19 (~4h)

Goal: **`/api/attest` and `/api/vote` return real responses in prod (mock proof verification OK — signing + contract call must be real).**

| Time | Task |
|---|---|
| 0:15 | Check Notion for team lead's asks. Pull latest. |
| 1:45 | Ask Antigravity (Planning Mode) to write `frontend/app/api/attest/route.ts` per PRD §7.4. Skip real zk.email proof verification for now — accept any proof in dev, focus on: nullifier computation, issuer signing, contract call via viem, Supabase insert, response shape. Deploy to Vercel. |
| 3:15 | Same for `frontend/app/api/vote/route.ts` per §7.4. Look up nullifier from `verified_users`, sign `{proposalId, nullifier, choice}`, call `SilentCouncil.vote()`, insert into `votes`. Deploy. |
| 3:45 | curl-test both endpoints from your terminal. Fix env var / Vercel issues. Ping team lead the deployed URL. |

**Do NOT** build `POST /api/proposals` (create-proposal UI is cut). Instead, seed 3 proposals directly in Supabase SQL editor:

```sql
insert into proposals (onchain_id, title, description, category, deadline, creator_wallet)
values
 ('0x1111...', 'Extend mess hours to 11 PM?',        'Currently mess closes at 9:30 PM...', 'mess',     now() + interval '5 days', '0xYourWallet'),
 ('0x2222...', 'Ban plastic bottles in hostels?',    'Move to reusable bottles...',         'hostel',   now() + interval '5 days', '0xYourWallet'),
 ('0x3333...', 'Longer library hours during exams?', '24×7 during exam weeks...',           'academic', now() + interval '5 days', '0xYourWallet');
```

Also create the same proposals on-chain via Remix (`createProposal` write function) with matching `onchain_id`s.

#### Day 2 — Thu Aug 20 (~4h)

Goal: **integrate real ZK proof verification OR ship the OTP fallback (§13.2). Full demo loop working in prod.**

| Time | Task |
|---|---|
| 0:15 | Standup with team lead. Confirm frontend calls your APIs and you can see requests in Vercel logs. |
| 2:00 | Wire the real `@zk-email/sdk` proof verification in `/api/attest`. Reuse blueprint `udp/gmail-domain-proof` from the zk.email registry — do NOT write a circuit. Test with your own Gmail. |
| 2:30 | If proof gen > 60s or blueprint doesn't fit: **switch to OTP fallback now**. Ship `/api/verify-otp` (Resend or Supabase-Auth-Email for the 6-digit code, hash email → nullifier, sign, call contract). Team lead swaps the frontend button. 45 min of work with Antigravity. |
| 3:30 | End-to-end test on prod with team lead. Verify → vote → double-vote-rejected loop must work. |
| 4:00 | Bug fixes. Deploy. |

**Hard rule: by end of Thu, the demo loop must work in prod. If it doesn't, Fri is emergency mode.**

#### Day 3 — Fri Aug 21 (~4h)

Goal: **stability + support team lead's video recording.** No new features.

| Time | Task |
|---|---|
| 0:30 | Fix whatever team lead's phone testing turned up. |
| 1:30 | Log sybil attempts: on every rejection path (`already_voted`, `not_verified`, `invalid_proof`), insert a row into `sybil_attempts`. 30 min of work. |
| 3:00 | Support team lead recording the Loom demo. Have his verify account ready. Pre-cast a vote or two so tallies look non-zero. |
| 4:00 | Push `contracts/DEPLOYMENT.md` — contract address, ABI (link to file), chain info, EAS schema UID, deploy notes. |

**Stretch (only if everything is stable):** Basescan contract verification. Not required.

#### Day 4 — Sat Aug 22 (~10h — SUBMIT DAY)

| Time | Task |
|---|---|
| 10:00 – 11:00 | Smoke test with team lead. Fix anything red. |
| 11:00 – 13:00 | Support README writing. Provide contract address, EAS schema UID, tech stack summary paragraphs. |
| 13:00 – 14:00 | Lunch. |
| 14:00 – 16:30 | Buffer for last bugs. If none, sit next to team lead during recording. |
| 16:30 – 17:00 | Submission confirmation. |
| 17:00 – 18:00 | Break. |
| 18:00 – 20:00 | Rehearse the technical Q&A with team lead. Judge questions you must answer in 15s each: "How do you prevent sybil?" "What's the trust model?" "Why Base Sepolia?" "How would you make this fully onchain?" See the honest answer in §4 ("Why the 'trusted issuer' pattern?"). |
| 20:00 | Done. Sleep. |

### 9.4 What you DELIVER to team lead — and when

| When | Deliverable | How |
|---|---|---|
| Tue end-of-day | Supabase URL + anon + service_role keys | Notion |
| Tue end-of-day | Contract deployed + address + ABI in `frontend/lib/contracts.ts` | Push |
| Tue end-of-day | EAS schema UID in `.env.example` | Push |
| Wed end-of-day | `POST /api/attest` + `POST /api/vote` return real responses in prod (proof verification can be a mock returning success) | Vercel URL |
| Thu end-of-day | Real ZK proof verification OR OTP fallback shipped in prod. Full verify → vote loop working. | Vercel + a video call |
| Fri end-of-day | `contracts/DEPLOYMENT.md` complete | Push |

### 9.5 What you EXPECT from team lead — and when

| When | Deliverable | If missing, do this |
|---|---|---|
| Tue ~2 PM | GitHub repo access | Ping him |
| Tue ~3 PM | Empty `frontend/app/api/{attest,vote,proposals}/route.ts` stubs + `lib/types.ts` | Create them yourself, 5 min job |
| Tue ~5 PM | Vercel URL live | Ping |
| Wed ~4 PM | Frontend visibly hitting your APIs | Test with curl / Postman if he's slow |

### 9.6 When you're blocked

- **Solidity compile error:** paste the whole error + code into Antigravity. It'll fix in one shot.
- **Remix deploy fails "insufficient funds":** more faucet ETH.
- **MetaMask popup doesn't appear when you click Deploy:** make sure "Environment" in Remix's Deploy tab is set to "Injected Provider - MetaMask", not "Remix VM".
- **`@zk-email/sdk` proof gen times out:** stop fighting it and ship the OTP fallback (§13.2). ZK is a "nice pitch," OTP is a "working demo." Working > nice.
- **Supabase Realtime not firing:** Database → Replication → toggle ON per-table.
- **API works locally, breaks on Vercel:** 95% missing env var. Check Vercel → Settings → Environment Variables. Redeploy after adding.
- **Anything broken for >30 min:** ping team lead. Screen share. Do not silent-fail.

---

## 10. Daily Sync Checkpoints (light touch — we have 4h/day, not 10)

Only two sync points per day. Text in the Notion / shared chat: **done / doing / blocked.** 5 min max.

| Day | Time | What must be true |
|---|---|---|
| Tue | end of day | Teammate: Supabase alive + contract deployed + EAS schema UID + Notion updated. TL: repo scaffolded + Vercel URL live. |
| Wed | end of day | Teammate: `/api/attest` + `/api/vote` return real responses in prod. TL: `/proposals/[id]` renders real data + vote buttons wired to backend. |
| Thu | end of day | **Demo loop works in prod.** Verify → open proposal → vote → try again → rejected. This is the P0 checkpoint. |
| Fri | end of day | Demo video recorded, Canva deck done, no new code going in. |
| Sat | 16:30 | **SUBMITTED on Devfolio.** Screenshot the confirmation. |

**Rule:** If a checkpoint slips by more than one calendar day → phone call, screen-share, one of you takes over the other's remaining work. Silent failure kills hackathons; this team has 4-hour days and zero slack.

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

## 16. Final Rules of Engagement (4h/day edition)

1. **The demo loop is sacred. Everything else is optional.** Landing → verify → vote → double-vote-rejected. If a task doesn't advance this loop before Sat morning, skip it.
2. **The PRD is the source of truth.** If a §2 feature isn't in "MUST SHIP," don't build it.
3. **No new features after Thu evening.** Fri = video + slides + bug fixes. Sat = submit.
4. **Deploy every day.** If it's not on Vercel, it doesn't exist.
5. **Test on a phone every day.** 30 seconds. Judges use phones.
6. **Commit every session end.** Even if broken. Message format: `[FE|BE|CT|DX] what changed`.
7. **Sleep 7+ hours.** You have 4-hour days; ruining Sat with fatigue costs you the submission.
8. **Eat real meals.** Not just Maggi.
9. **Under-scope hard. Over-deliver.** Every optional feature we don't build is 30 min more polish or sleep for Sat.
10. **When you disagree, defer to the PRD.** When PRD is ambiguous, team lead decides.
11. **If Antigravity/Cursor makes a change and you don't understand it — reject.** Vibecoders shipping unreviewed code lose Sat to debugging.
12. **Have fun.** If you both hate it by Wednesday, we're building the wrong thing. Say something.

---

**Now go build. Ship Sat Aug 22 by 5 PM. Nothing else matters.**

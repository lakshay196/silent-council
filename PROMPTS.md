# AI Prompts — Silent Council

**How to use this file:**
1. Setup section — do **once**, on Tuesday.
2. Every day, jump to the section with today's **date** and paste the code block into your AI chat.
3. That's it. There is no Step 3 vs Step 4 confusion — just dates.

Two people, two sections:
- **Lakshay** (Mac, Cursor) → jump to "Lakshay's daily blocks"
- **Krishna** (Windows, Antigravity) → jump to "Krishna's daily blocks"

The AI writes the code. Pasting takes 30 seconds; the full session is still ~4h because you Approve, `git push`, and click browser stuff.

---

# 🟣 LAKSHAY (Cursor)

## One-time setup — `.cursorrules`

Create a file named `.cursorrules` in `frontend/` root (after Tue scaffolds it). Paste this once:

```
# Silent Council — Cursor Rules

## Project
- Frontend for Silent Council, ZK-verified onchain student voting app for NITK.
- Read PRD.md at the workspace root before architectural decisions.
- We are pure vibecoders; explain changes in plain English.

## Stack (do NOT deviate)
- Next.js 15 App Router + TypeScript strict
- Tailwind CSS 4 + shadcn/ui
- wagmi v2 + viem + RainbowKit
- @zk-email/sdk (call site: frontend/lib/zk-email.ts)
- @supabase/supabase-js (call site: frontend/lib/supabase.ts)
- Chain: Base Sepolia (chainId 84532), RPC https://sepolia.base.org

## Conventions
- Shared types in frontend/lib/types.ts. Import, never redefine.
- Contract ABI + address in frontend/lib/contracts.ts.
- API routes match PRD §7.4 signatures EXACTLY.
- No `any`. Use `unknown` and narrow.
- No inline styles. Tailwind only.
- Prefer shadcn/ui before hand-rolling.
- Dark theme, indigo/violet accent.
- Every page mobile-responsive.

## Behavior
- Check for existing files before creating new ones.
- Flag TypeScript errors before I commit.
- Do NOT install new dependencies without asking.
- Do NOT touch /verifier/, /examples/, or /contracts/.
- Commits: `[FE] <what changed>`. <60 chars.

## When you don't know
- Reference PRD.md sections explicitly, e.g. "per PRD §7.4".
- If PRD is ambiguous, ask before guessing.

## Priorities
- Shipping > perfection.
- Working demo > code quality.
- Judge-facing polish > developer ergonomics.
```

---

## Lakshay's daily blocks

Only paste the block matching today's date. Ignore the others.

---

### 📅 Tue 18 Aug — scaffold the empty app

Paste this into a fresh Cursor Composer:

```
I'm Lakshay building Silent Council for the Road to Devcon NITK hackathon. Read @PRD.md — focus on §0, §2, §5, §7, §8.3 Day 0.

Today is Tue 18 Aug 2026. Day 0. ~4 hours total. Ship the SKELETON only: scaffold + wallet + landing page shell. I deploy to Vercel myself.

Per PRD §2 "CUT" list: do NOT install framer-motion, canvas-confetti, or recharts.

Do these tasks in order, one commit per task. Wait for my OK before the next.

1. Bootstrap frontend inside `frontend/`:
   - npx create-next-app@latest frontend --typescript --tailwind --app --eslint --src-dir=false --import-alias='@/*' --no-turbopack
   - Yes to defaults.

2. cd frontend, install ONLY these deps:
   - npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query @supabase/supabase-js @zk-email/sdk date-fns clsx tailwind-merge sonner

3. shadcn/ui:
   - npx shadcn@latest init — TypeScript yes, style Default, base color Slate, CSS variables yes.
   - npx shadcn@latest add button card badge dialog input textarea select label separator skeleton

4. Create frontend/lib/types.ts with types per PRD §7.5 (ProposalCategory, Proposal, VerifiedUser, VOTE_CHOICES, VoteChoice, parseAllowedDomains).

5. Create frontend/lib/contracts.ts — export SILENT_COUNCIL_ADDRESS from env, empty SILENT_COUNCIL_ABI = [] as const (Krishna fills tonight), EAS_ADDRESS = "0x4200000000000000000000000000000000000021".

6. Create frontend/lib/supabase.ts — createClient with the two NEXT_PUBLIC env vars.

7. Create frontend/.env.example with every var per PRD §7.1 (including NEXT_PUBLIC_ALLOWED_DOMAINS=nitk.edu.in,gmail.com).

8. Create stub API route files:
   - frontend/app/api/attest/route.ts — POST returns { ok: false, error: 'not_implemented', message: 'stub' }
   - frontend/app/api/vote/route.ts — same
   - frontend/app/api/proposals/route.ts — same

9. Wire wagmi + RainbowKit for Base Sepolia (84532):
   - frontend/app/providers.tsx — WagmiProvider + RainbowKitProvider darkTheme + QueryClientProvider
   - frontend/app/layout.tsx wraps children in <Providers>
   - Top-nav <ConnectButton />

10. Minimal landing at frontend/app/page.tsx:
    - Dark bg, indigo/violet gradient
    - Title "Silent Council", subtitle "Onchain voting for NITK. Verified voters, secret ballots, public tallies."
    - Primary CTA "Verify with NITK email" → /verify (dead link OK)
    - Optional tiny subtitle under CTA: "Demo also accepts Gmail" — NITK branding stays, we are not NITK students
    - Secondary CTA "See live proposals" → /proposals
    - Three hardcoded proposal <Card>s below the fold — static, no animations, no fake counters
    - Footer: GitHub link + "Built at Road to Devcon NITK Surathkal"
    - Mobile responsive

STOP after step 10. I'll git push and deploy to Vercel manually.
```

---

### 📅 Wed 19 Aug — proposal detail + verify pages

```
Read @PRD.md §2 MUST SHIP and §8.3 Day 1. Today is Wed 19 Aug 2026. I have ~4 hours.

I'm Lakshay, frontend. Krishna owns APIs and the contract.

Do ONLY this, in order. Commit after each. Wait for my OK before the next.

1. Pull latest. If Krishna pushed an ABI + address, put them in frontend/lib/contracts.ts and .env.local.

2. Build frontend/components/tally-bar.tsx:
   - Props { yes: number; no: number; abstain: number }
   - Three coloured divs side-by-side, widths as % of total (green/red/gray)
   - Count labels inline
   - Plain CSS, no Recharts, no Framer Motion, under 40 lines.

3. Build frontend/app/proposals/[id]/page.tsx:
   - Fetch proposal from Supabase: supabase.from('proposals').select('*').eq('id', params.id).single()
   - Show title, description, category badge
   - <TallyBar yes={p.tally_yes} no={p.tally_no} abstain={p.tally_abstain} />
   - Three buttons Yes/No/Abstain that POST /api/vote per PRD §7.4
   - sonner toast on success (tx hash) or error (per §7.4 error enum)

4. Build frontend/app/verify/page.tsx:
   - Client component
   - RainbowKit connect button + "Verify NITK Email" button
   - One line of helper text: "Production: @nitk.edu.in. This demo also accepts Gmail."
   - On click: POST /api/attest with { wallet, zkEmailProof: 'mock', publicInputs: {} } — Krishna's endpoint accepts mock in dev
   - Show success/error status text (including wrong_domain)
   - Green ✓ in top nav if useReadContract on isVerified(address) is true (if ABI empty, skip badge safely)

Do NOT build /dashboard, /verifiability, /pitch, /proposals feed, category filters, deadline countdowns.

STOP when the two pages render. Tell me what Vercel env vars I need to set.
```

---

### 📅 Thu 20 Aug — wire the full demo loop

```
Read @PRD.md §2 MUST SHIP and §8.3 Day 2. Today is Thu 20 Aug 2026. I have ~4 hours.

Priority: verify → open proposal → vote → vote again → rejected — must work in production.

1. Pull latest.

2. Wire vote buttons fully to POST /api/vote. Handle already_voted, not_verified, proposal_closed with sonner toasts. Show tx hash on success.

3. Wire /verify to POST /api/attest for real (or OTP if Krishna shipped that on Thu). On success show ✓ badge.

4. If Krishna seeded 3 proposals in Supabase, landing cards must link to real /proposals/[id] UUIDs — not hardcoded junk.

5. Mobile pass: no horizontal scroll, buttons tappable on a phone-width screen.

Do not add new pages or packages. If something is blocked on Krishna, stub it and list exactly what I need from him.
```

---

### 📅 Fri 21 Aug — polish only, no new features

```
Read @PRD.md §8.3 Day 3 and §11 demo script. Today is Fri 21 Aug 2026. I have ~4 hours.

NO NEW FEATURES. No dashboard, no charts, no confetti.

1. Fix any TypeScript / Vercel build errors.

2. Make copy on landing + verify + proposal pages judge-readable (short, clear).

3. Create docs/demo-script.md with the 90s script from PRD §11 if missing.

4. List 4 screenshot paths I should capture: landing, verify, proposal, vote toast.

5. If AND ONLY IF the demo loop already works: optional 30-min add of live tally via Supabase Realtime. Skip if anything is broken.

I record Loom + make Canva slides myself. You make the app stable and copy clean.
```

---

### 📅 Sat 22 Aug — submit day (submit by 5 PM IST)

```
Read @PRD.md §12 and §8.3 Day 4. Today is Sat 22 Aug 2026. Submit on Devfolio by 5 PM IST.

1. Smoke-test happy path in code: verify page, proposal page, vote error handling. Fix P0 bugs only.

2. Write a short public README.md: one-paragraph pitch, live URL placeholder, GitHub link, tech stack, credits (zk.email, EAS, Base, Krishna + Lakshay).

3. Do not add features. Do not refactor.

I deploy, screenshot, record, and submit. After README, STOP.
```

---

### 📅 Sun 23 Aug — only if judges flag a bug

```
Today is Sun 23 Aug 2026, judging day. Do not add features.

Fix only the bug I paste below:

<paste judge / demo bug>

Smallest possible change. Then tell me how to redeploy on Vercel.
```

---

### When you're stuck (any day)

```
I'm stuck on <problem>. Here's what's happening: <describe>. Here's the error: <paste>.

Analyze the root cause. List 3 possible fixes ranked by likelihood. Then implement fix #1. If it doesn't work I'll paste the new error and we try #2.
```

---

# 🟢 KRISHNA (Antigravity)

## One-time setup — `AGENTS.md`

`AGENTS.md` is already in the repo root (Lakshay committed it Tuesday). You don't create it. Antigravity reads it automatically when you open the folder.

**Your Tuesday manual clicks are in `docs/KRISHNA_SETUP.md`.** Do those first before pasting any prompt below.

---

## Krishna's daily blocks

Only paste the block matching today's date.

---

### 📅 Tue 18 Aug — Antigravity bootstrap

**Before this prompt:** complete `docs/KRISHNA_SETUP.md` Steps 1–6 (install, MetaMask, faucet, clone repo, open in Antigravity, Supabase project + schema).

Then paste this as your first Antigravity message:

```
Read @PRD.md — focus on §7, §9.3 Day 0, §13. Read @AGENTS.md.

I'm Krishna, Contracts + Backend engineer for Silent Council. Today is Tue 18 Aug 2026. I have ~4 hours. Per PRD §9.3 Day 0, my deliverables by end of today:

1. Supabase alive with schema per §7.2 + Realtime enabled on votes + proposals (I do this myself per docs/KRISHNA_SETUP.md Step 6)
2. contracts/SilentCouncil.sol drafted per §7.3 (YOU write this)
3. Contract deployed to Base Sepolia via Remix (I click, per KRISHNA_SETUP.md Step 8)
4. Contract address + ABI in frontend/lib/contracts.ts (YOU update)
5. EAS schema at easscan.org, UID in .env.example (I click, YOU update)

Draft contracts/SilentCouncil.sol now, implementing ISilentCouncil exactly per PRD §7.3:
- Solidity 0.8.20, MIT license
- OpenZeppelin ECDSA for signature recovery
- Constructor: address issuer, address initialOwner
- Natspec on every external function
- All events per interface

Use Planning Mode. Show me the full contract file. Wait for my OK before touching anything else.
```

Then follow `docs/KRISHNA_SETUP.md` Steps 8–10 to deploy and paste back.

---

### 📅 Wed 19 Aug — API routes

```
Read @PRD.md §7.4 and §9.3 Day 1. Today is Wed 19 Aug 2026. I'm Krishna. ~4 hours.

Use Planning Mode. Wait for my OK before editing files.

1. Implement POST frontend/app/api/attest/route.ts per PRD §7.4.
   - Mock zk.email proof verification for now (accept any proof in dev).
   - After extracting email: domain (after @, lowercase) MUST be in NEXT_PUBLIC_ALLOWED_DOMAINS split by comma (nitk.edu.in and gmail.com). Else return { ok: false, error: 'wrong_domain' }.
   - Real parts: nullifier = keccak256(email + DOMAIN_SALT), issuer signMessage, call SilentCouncil.verifyVoter via viem, insert verified_users, return §7.4 JSON shape.

2. Implement POST frontend/app/api/vote/route.ts per PRD §7.4.
   - Lookup nullifier, sign, call SilentCouncil.vote, insert votes, bump tally on proposals.

3. GET /api/proposals reads from Supabase. Skip create-proposal UI (cut).

4. Give me the SQL to paste in Supabase to seed 3 proposals (mess hours, plastic bottles, library hours) matching PRD §9.3.

5. Tell me exactly which Vercel env vars Lakshay must set.

Do not write custom circuits. Do not add extra routes.
```

---

### 📅 Thu 20 Aug — real ZK or ship OTP fallback

```
Read @PRD.md §9.3 Day 2 and §13.2. Today is Thu 20 Aug 2026. I'm Krishna. ~4 hours.

Goal: verify → vote → double-vote-rejected works in production.

1. Pull latest. Check Vercel logs if Lakshay shares them.

2. Try to replace mock attest with @zk-email/sdk + blueprint udp/gmail-domain-proof.

3. If zk.email isn't working within 60 minutes: implement POST /api/verify-otp per §13.2 (email code → hash email → same nullifier + verifyVoter path). Same domain allow-list: nitk.edu.in and gmail.com only. Tell Lakshay the frontend button change in one paragraph.

4. On already_voted / invalid_proof / not_verified, insert sybil_attempts row.

5. Planning Mode first. Then implement. I curl-test and ping Lakshay.

No load tests. No extra features.
```

---

### 📅 Fri 21 Aug — bugfix + docs only

```
Read @PRD.md §9.3 Day 3. Today is Fri 21 Aug 2026. I'm Krishna. ~4 hours.

NO NEW FEATURES.

1. Fix bugs Lakshay reports. P0 only.

2. Write contracts/DEPLOYMENT.md: chain Base Sepolia 84532, contract address, EAS schema UID, how we deployed via Remix.

3. Confirm seed proposals exist in Supabase. If not, give me SQL to paste.

4. Optional: Basescan verify — only if everything else is stable. Skip otherwise.

Support Lakshay's Loom recording: keep APIs up.
```

---

### 📅 Sat 22 Aug — submit day support

```
Today is Sat 22 Aug 2026. Submit by 5 PM IST. I'm Krishna.

1. Fix only P0 bugs Lakshay pastes.

2. Give Lakshay 4 bullets for Devfolio: contract address, EAS UID, trust model (offchain zk verify + issuer signature), how double-vote is blocked (nullifier).

3. No new features. No refactors.

If nothing is broken, wait. Do not invent work.
```

---

### 📅 Sun 23 Aug — only if judging bug

```
Today is Sun 23 Aug 2026 judging day. Fix only this bug:

<paste bug>

Smallest change. Remind me to redeploy Vercel / Remix if the contract must change.
```

---

### When you're stuck (any day)

```
Stuck on <problem>. Context:
- <what I tried>
- <error pasted>
- <relevant file: @path/to/file>

Enter Planning Mode. Diagnose the root cause. Show me 3 candidate fixes. I'll pick one.
```

---

# 🖱️ KRISHNA'S BROWSER-CLICK CHECKLISTS (Windows)

These are the manual steps Antigravity cannot do. Full click-by-click version is in `docs/KRISHNA_SETUP.md`. Short summary here for reference:

- **Supabase setup** — supabase.com → new project → paste PRD §7.2 SQL in SQL Editor → toggle Realtime on `votes` + `proposals` → copy URL + anon key + service_role key into Notion.
- **Remix deploy** — remix.ethereum.org → paste `.sol` → Compile 0.8.20 → Deploy tab, Environment "Injected Provider - MetaMask", Base Sepolia network → constructor args (issuer + owner addresses) → Deploy → sign popup → copy address + ABI into `frontend/lib/contracts.ts`.
- **EAS schema** — base-sepolia.easscan.org/schema/create → schema `address wallet, string domain, bytes32 nullifier` → revocable ON → sign popup → copy UID into `.env.example`.
- **Vercel env vars** (after Lakshay deploys frontend) — vercel.com → project → Settings → Environment Variables → paste every var from PRD §7.1 → redeploy.

**Wallet safety:** the `ISSUER_PRIVATE_KEY` is a private key. Use the fresh MetaMask account with zero real ETH. Never your main wallet.

---

# Shared prompts (both use)

### Bug bash — Fri evening

```
Read @PRD.md. Enter Planning Mode.

Act as a QA engineer. Try to break Silent Council. Enumerate 15 attack vectors:
- Sybil (double vote, wallet swap, browser cache)
- Race conditions (2 votes at same timestamp)
- Missing/invalid inputs (empty title, past deadline, invalid choice)
- Wallet edge cases (wrong chain, insufficient gas, rejected sig)
- API abuse (spam POST /api/vote, malformed JSON, oversized payload)
- Frontend crashes (broken image, mobile Safari overflow)

For each: test description, expected behavior, current behavior. Prioritize by severity.
```

### Judge-eye review — Sat morning

```
Read @PRD.md and @README.md.

Act as a hackathon judge for Road to Devcon NITK Surathkal (theme: Private Apps using Ethereum). Score Silent Council out of 10 on:
- Novelty
- Technical execution
- Demo quality
- Theme fit
- Real-world usefulness

For each, note 2 things that would raise the score by 1 point in <2 hours of work.
```

---

# When you disagree with the AI

- Wants to add a dependency the PRD forbids → say no, cite the PRD section.
- Skips a PRD requirement → paste the section number back.
- Same mistake repeatedly → paste the whole PRD section as literal context.
- Going in circles → `/rewind` (Antigravity) or reject last N edits (Cursor) and try a smaller sub-task.

# AI IDE Bootstrap Prompts — Silent Council

Copy the relevant section into your AI IDE as your **first message** for the project. These prompts encode the full project context so the AI can autonomously make good decisions without you re-explaining every time.

---

## For Team Lead (Cursor Pro)

### Step 1 — Add `.cursorrules` to `frontend/` root

Create a file named `.cursorrules` in `frontend/` with this content:

```
# Silent Council — Cursor Rules

## Project
- This is the frontend for Silent Council, a ZK-verified onchain student voting app for NITK.
- Read PRD.md at the workspace root before making architectural decisions.
- We are pure vibecoders; explain your changes in plain English.

## Stack (do NOT deviate)
- Next.js 15 App Router + TypeScript (strict)
- Tailwind CSS 4 + shadcn/ui
- wagmi v2 + viem + RainbowKit
- @zk-email/sdk (call site: `frontend/lib/zk-email.ts`)
- @supabase/supabase-js (call site: `frontend/lib/supabase.ts`)
- Chain: Base Sepolia (chainId 84532), RPC https://sepolia.base.org

## Conventions
- All shared types live in `frontend/lib/types.ts`. Import from there, never redefine.
- Contract ABI + address live in `frontend/lib/contracts.ts`.
- API routes match PRD §7.4 signatures EXACTLY. If a signature seems wrong, ask; do not silently deviate.
- No `any` types. Use `unknown` and narrow.
- No inline styles. Tailwind only.
- Prefer shadcn/ui components before hand-rolling.
- Dark theme by default. Indigo/violet accent.
- Every page must be mobile-responsive.

## Behavior
- Before creating a new file, check if a similar file exists. Extend instead of duplicate.
- After edits, run `npm run build` mentally — flag TypeScript errors before committing.
- Do NOT install new dependencies without asking me first.
- Do NOT touch anything under `/verifier/`, `/examples/`, or `/contracts/` — those are the teammate's turf or the friend's SP1 repo.
- Commit messages: `[FE] <what changed>`. Keep <60 chars.

## When you don't know
- Reference PRD.md sections explicitly, e.g., "per PRD §7.4."
- If PRD is ambiguous, ask before guessing.

## What to prioritize
- Shipping > perfection.
- Working demo > code quality.
- Judge-facing polish > developer ergonomics.
```

### Step 2 — First-day kickoff prompt (paste into Cursor Composer, Day 0, ~3 PM)

```
I'm the team lead building Silent Council for the Road to Devcon NITK hackathon. Read PRD.md (@PRD.md) end to end before responding.

My role is per PRD §8. Today is Day 0 (Tue Aug 18). I have ~10 hours until midnight.

Do these tasks in order, one commit per task:

1. Bootstrap the frontend inside `frontend/`:
   - Run `npx create-next-app@latest frontend --typescript --tailwind --app --eslint --src-dir=false --import-alias='@/*' --no-turbopack`
   - Say yes to defaults.
   - Wait for it to finish.

2. cd into frontend, then install deps:
   - `npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query @supabase/supabase-js @zk-email/sdk framer-motion canvas-confetti recharts date-fns clsx tailwind-merge`
   - `npm install -D @types/canvas-confetti`

3. Set up shadcn/ui:
   - `npx shadcn@latest init` — pick: TypeScript yes, style "Default", base color "Slate", CSS variables yes, tailwind.config.ts, components/ui, utils lib/utils.
   - Install a starter set: `npx shadcn@latest add button card badge dialog input textarea select label toast sonner separator skeleton avatar`

4. Create `frontend/lib/types.ts` with the TypeScript types per PRD §7.5. Include everything: ProposalCategory, Proposal, VerifiedUser, VOTE_CHOICES, VoteChoice.

5. Create `frontend/lib/contracts.ts` with a placeholder for the SilentCouncil contract address (import from env var), a placeholder ABI array (empty for now — teammate will supply Day 1), and the EAS Base Sepolia address 0x4200000000000000000000000000000000000021.

6. Create `frontend/lib/supabase.ts` — export a `supabase` client using createClient with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.

7. Create `frontend/lib/zk-email.ts` — stub the zk.email SDK integration. Just re-export `initZkEmailSdk` with a `getSdk()` helper. We'll flesh it out later.

8. Create `frontend/.env.example` with all vars per PRD §7.1.

9. Set up wagmi + RainbowKit for Base Sepolia:
   - Create `frontend/app/providers.tsx` — wraps children in WagmiProvider, RainbowKitProvider (darkTheme), QueryClientProvider.
   - Update `frontend/app/layout.tsx` to wrap children in <Providers>.

10. Ask me for a `.env.local` file to test locally — provide reasonable defaults.

STOP after step 10 and confirm with me before moving to landing page work.
```

### Step 3 — Landing page prompt (Day 0, ~7 PM)

```
Per PRD §2 feature 1 and PRD §8.3 Day 0 timeline, build the landing page.

Requirements:
- Route: `frontend/app/page.tsx`
- Full-screen hero, dark theme with indigo/violet gradient background
- Big title "Silent Council" (Geist Bold, huge)
- Subtitle: "Onchain voting for NITK. Verified voters, secret ballots, public tallies."
- Primary CTA: "Verify with your NITK email" (Button component, size lg, shadcn Button variant="default", links to /verify)
- Secondary CTA: "See live proposals" (variant="outline", links to /proposals)
- Animated stat counters (use Framer Motion or a simple CSS transition):
  - "1,247 verified students" (fake for now, wire real data later)
  - "23 active proposals"
  - "12 sybil attempts blocked" (with 🛡️ emoji)
- Below the fold: "How it works" section with 3 cards (Verify · Vote · Verify Others), each with an icon (lucide-react)
- Footer with GitHub link, EAS attestation link (placeholder for now), and "Built at Road to Devcon NITK Surathkal"
- Full mobile responsiveness

Inspiration: linear.app, vercel.com. Feel professional and cryptographic.

After building, commit with `[FE] landing page hero`. Then push. Confirm with me.
```

### Step 4 — Daily kickoff prompt template (paste each morning)

```
Good morning. Read PRD.md and the latest git log first.

Today is Day <N> per PRD §8.3. My focus areas:
- <copy the task list from PRD §8.3 for the day>

Start with task 1. After each task, commit and confirm with me before moving on.

Blockers from yesterday: <list any>
Waiting on teammate for: <list any>
```

### Step 5 — When you're stuck

Prompt Cursor with:

```
I'm stuck on <problem>. Here's what's happening: <describe>. Here's the error: <paste>.

Analyze the root cause. List 3 possible fixes ranked by likelihood of working. Then implement fix #1. If it doesn't work I'll paste the new error and we try #2.
```

---

## For Teammate (Antigravity + Google One)

### Step 1 — Create `AGENTS.md` at the workspace root

Create this file in the repo root **before** starting Antigravity work. Its content is below in Step 2.

### Step 2 — `AGENTS.md` content

Save this exact content as `AGENTS.md` at the workspace root:

```
# Silent Council — AGENTS.md

## Project
Silent Council is a ZK-verified onchain student voting app for NITK, built for the Road to Devcon NITK Surathkal hackathon (Aug 17–23, 2026).

The full product spec is in @PRD.md. Read it before every major task.

## Your role
You are the Contracts + Backend engineer per PRD §9. You own:
- Solidity contract `contracts/SilentCouncil.sol`
- Supabase schema + realtime setup
- Next.js API routes in `frontend/app/api/`
- zk.email SDK integration (server-side, in API routes)
- Issuer signing logic
- EAS schema on Base Sepolia
- Contract deployment via Remix IDE

## Stack (locked, do not deviate)
- Solidity 0.8.20, deployed via Remix IDE to Base Sepolia (chainId 84532)
- Contracts framework: none — Remix in browser
- OpenZeppelin contracts for ECDSA signature recovery
- Supabase (Postgres + Realtime)
- viem (server-side ethers alternative for Node.js) inside Next.js API routes
- @zk-email/sdk for proof verification
- @ethereum-attestation-service/eas-sdk for issuing EAS attestations

## Project Rules
- Use TypeScript strict mode.
- All API route signatures MUST match PRD §7.4 exactly.
- All Supabase schema MUST match PRD §7.2 exactly.
- Smart contract MUST implement ISilentCouncil interface per PRD §7.3.
- Env var names MUST match PRD §7.1 exactly.
- Do NOT modify anything under `frontend/app/` (pages) — that's team lead's turf.
- Do NOT modify `frontend/components/` unless it's a new server-side helper.
- Do modify `frontend/lib/contracts.ts` when you deploy the contract (paste ABI + address).
- Commit messages: `[BE] <what changed>` or `[CT] <what changed>` (contract). Keep <60 chars.

## Agent Configuration
- ALWAYS use Planning Mode before writing more than 20 lines of code.
- Present a plan first, wait for approval, then execute.
- Reference PRD sections explicitly in your plans, e.g., "per PRD §7.4."
- If PRD is ambiguous, ask the human before guessing.
- After changes to Solidity, remind human to re-deploy via Remix.
- After changes to Supabase schema, remind human to run the migration in Supabase Studio.

## What to prioritize
- Interface contracts (PRD §7) are sacred — never change without approval.
- Shipping > perfection.
- If something works but is inelegant, ship it and note it.
- If you finish early, prioritize the fallback plans in PRD §13, especially §13.2 email OTP fallback.

## Validation loops
- After each contract change: request that the human recompile + redeploy via Remix, then paste the address back.
- After each API route: request the human to curl-test with a sample payload matching PRD §7.4.
- Before every commit, ensure TypeScript compiles: `cd frontend && npx tsc --noEmit`.

## What NOT to do
- Do NOT write custom ZK circuits. Use @zk-email/sdk as-is.
- Do NOT touch anything in /verifier/ or /examples/ (that's the friend's SP1 repo).
- Do NOT add new dependencies without asking.
- Do NOT deploy to any chain other than Base Sepolia.
- Do NOT change env var names or API signatures without updating PRD.
```

### Step 3 — First-message bootstrap prompt (paste into Antigravity, Day 0, ~3 PM)

```
Read @PRD.md and @AGENTS.md completely before responding.

I'm the Contracts + Backend engineer for Silent Council. My role and timeline are per PRD §9.

Today is Day 0 (Tue Aug 18, 2026). I have ~10 hours until midnight. My deliverables by end of today per PRD §9.3:

1. Supabase project created, schema deployed per PRD §7.2, Realtime enabled on `votes` and `proposals` tables
2. Solidity contract `contracts/SilentCouncil.sol` drafted per PRD §7.3
3. Contract deployed to Base Sepolia via Remix IDE
4. Contract address + ABI added to `frontend/lib/contracts.ts`
5. EAS schema created via base-sepolia.easscan.org, UID saved
6. `.env.example` updated with EAS schema UID
7. Everything shared with team lead

Use Planning Mode. Present me with a detailed plan for the next 4 hours (through 7 PM):
- What order will you do these tasks?
- Which do you need my input for (e.g., account credentials)?
- Which can you generate autonomously (e.g., drafting Solidity)?
- What's your rollback if a step fails?

DO NOT execute yet. Wait for my approval of the plan.
```

### Step 4 — Contract drafting prompt (Day 0, ~5 PM, after Supabase is done)

```
Draft `contracts/SilentCouncil.sol` per PRD §7.3.

Requirements:
- Implement the ISilentCouncil interface exactly as specified
- Solidity 0.8.20, MIT license
- Import OpenZeppelin's ECDSA for signature recovery (paste the imports directly from https://github.com/OpenZeppelin/openzeppelin-contracts if needed for Remix compatibility)
- Nullifier verification: on `vote()` and `verifyVoter()`, recover the signer of the message and require it equals the `issuer` address stored at construction
- Message format for `verifyVoter`: keccak256(abi.encodePacked(wallet, nullifier))
- Message format for `vote`: keccak256(abi.encodePacked(proposalId, choice, nullifier))
- Both messages must be prefixed per EIP-191 (\x19Ethereum Signed Message:\n32) before signature verification. Use ECDSA.toEthSignedMessageHash if the OZ lib is available; otherwise inline the prefix.
- Emit all events per interface
- Include natspec comments on every external function
- Add a `owner`-only `updateIssuer(address)` function for rotating the issuer key (Ownable pattern, use OZ Ownable)

After drafting:
1. Show me the contract
2. Explain the security model in 5 bullets
3. List the constructor arguments I need to provide when deploying (issuer address, initial owner)
4. Explain how to deploy via Remix step by step, assuming I have MetaMask on Base Sepolia and ETH from faucet

Use Planning Mode first if the plan isn't obvious.
```

### Step 5 — API route implementation prompt (Day 1, ~11 AM)

```
Read PRD §7.4 and §9.3 (Day 1 timeline).

Implement `frontend/app/api/attest/route.ts` — the POST endpoint per PRD §7.4.

Full plan:
1. Read the request body: `{ wallet, zkEmailProof, publicInputs }`
2. Validate wallet is a 0x-prefixed 42-char string
3. Initialize @zk-email/sdk (import initZkEmailSdk, call it)
4. Load our blueprint (we'll use slug "TODO" for now — I'll fill in later; use a placeholder that returns success in dev mode)
5. Call blueprint.verifyProof(proof) — must return true or throw
6. Extract the email from publicInputs (structure depends on our blueprint — assume `publicInputs.email` for now)
7. Assert the domain matches process.env.NEXT_PUBLIC_ALLOWED_DOMAIN
8. Compute nullifier = viem.keccak256(concat(email_bytes, domain_salt_bytes))
9. Query Supabase `verified_users` for existing wallet OR nullifier — if either exists, return `{ok: false, error: 'already_verified'}` and log a sybil_attempts row
10. Load ISSUER_PRIVATE_KEY from env, create a viem walletClient
11. Sign message keccak256(abi.encodePacked(wallet, nullifier)) with EIP-191 prefix — use viem's signMessage with { message: { raw: '0x...' } }
12. Call SilentCouncil.verifyVoter(wallet, nullifier, sig) via viem writeContract
13. Wait for tx receipt
14. Insert into Supabase `verified_users` { wallet, nullifier, attestation_uid, attested_at }
15. Return { ok: true, nullifier, issuerSignature, attestationUid: <from EAS event or a placeholder for now> }

Handle every error path per PRD §7.4 error enum.

Present the full file. Use Planning Mode. Wait for my approval.
```

### Step 6 — Daily kickoff prompt template (paste each morning)

```
Good morning. Read the latest git log and @PRD.md.

Today is Day <N> per PRD §9.3. My tasks for today:
- <copy from PRD>

Deliverables I owe team lead today:
- <copy from PRD §9.4 for this day>

Blockers from yesterday: <list>
Waiting on team lead for: <list>

Present a plan for the first 3 hours in Planning Mode.
```

### Step 7 — When you're stuck

```
Stuck on <problem>. Context:
- <what I tried>
- <error message pasted>
- <relevant file: @path/to/file>

Enter Planning Mode. Diagnose the root cause. Show me 3 candidate fixes. I'll pick one.
```

---

## Shared prompts (both use)

### Bug bash prompt (Day 3, Fri evening)

```
Read @PRD.md. Enter Planning Mode.

I want you to act as a QA engineer. Try to break Silent Council. Enumerate 15 attack vectors and edge cases:
- Sybil (double vote, wallet swap, browser cache exploit)
- Race conditions (2 votes at same timestamp)
- Missing/invalid inputs (empty title, past deadline, invalid choice enum)
- Wallet edge cases (wrong chain, insufficient gas, rejected sig)
- API abuse (spam POST /api/vote, malformed JSON, oversized payload)
- Frontend crashes (broken image, mobile Safari overflow)

For each: describe the test, the expected behavior, the current behavior. Prioritize by severity.
```

### Pre-submission review prompt (Day 4, Sat morning)

```
Read @PRD.md and @README.md.

Act as a hackathon judge for the Road to Devcon NITK Surathkal hackathon (theme: Private Apps using Ethereum). Review the current state of Silent Council and score it out of 10 on:
- Novelty
- Technical execution
- Demo quality
- Theme fit
- Real-world usefulness

For each, note 2 things that would raise the score by 1 point in <2 hours of work.
```

---

## When you disagree with the AI

- If the AI wants to add a dependency the PRD doesn't allow → say no, explain PRD constraint.
- If the AI's plan skips a PRD requirement → point to the section number.
- If the AI keeps making the same mistake → paste `PRD.md` section again as literal context.
- If the AI is going in circles → `/rewind` (Antigravity) or reject the last N edits (Cursor) and try a smaller sub-task.

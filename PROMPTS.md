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

### Step 2 — Day 0 kickoff prompt (paste into Cursor Composer, Tue Aug 18)

```
I'm the team lead building Silent Council for the Road to Devcon NITK hackathon. Read PRD.md (@PRD.md) — focus on §0, §2, §5, §7, §8.3 Day 0.

My role is per PRD §8. Today is Day 0. I have ~4 hours total, so we ship the SKELETON only: scaffold + wallet + landing page shell + Vercel deploy. Feature cuts per PRD §2 "CUT" list — do NOT install framer-motion, canvas-confetti, or recharts.

Do these tasks in order, one commit per task. Do not proceed to the next until I confirm.

1. Bootstrap the frontend inside `frontend/`:
   - `npx create-next-app@latest frontend --typescript --tailwind --app --eslint --src-dir=false --import-alias='@/*' --no-turbopack`
   - Say yes to defaults.

2. `cd frontend`, then install ONLY these deps (no animations, no charts):
   - `npm install wagmi viem @rainbow-me/rainbowkit @tanstack/react-query @supabase/supabase-js @zk-email/sdk date-fns clsx tailwind-merge sonner`

3. Set up shadcn/ui:
   - `npx shadcn@latest init` — TypeScript yes, style "Default", base color "Slate", CSS variables yes.
   - `npx shadcn@latest add button card badge dialog input textarea select label separator skeleton`

4. Create `frontend/lib/types.ts` with all types per PRD §7.5 (ProposalCategory, Proposal, VerifiedUser, VOTE_CHOICES, VoteChoice).

5. Create `frontend/lib/contracts.ts` — export `SILENT_COUNCIL_ADDRESS` (from `process.env.NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS`), an empty `SILENT_COUNCIL_ABI = [] as const` (teammate fills tonight), and `EAS_ADDRESS = "0x4200000000000000000000000000000000000021"`.

6. Create `frontend/lib/supabase.ts` — `createClient` with the two NEXT_PUBLIC env vars.

7. Create `frontend/.env.example` with every var per PRD §7.1.

8. Create empty stub route files (so teammate's edits don't conflict):
   - `frontend/app/api/attest/route.ts` — export a POST that returns `{ ok: false, error: 'not_implemented', message: 'stub' }`
   - `frontend/app/api/vote/route.ts` — same
   - `frontend/app/api/proposals/route.ts` — same

9. Wire wagmi + RainbowKit for Base Sepolia (chainId 84532):
   - `frontend/app/providers.tsx` wrapping WagmiProvider + RainbowKitProvider (darkTheme) + QueryClientProvider.
   - Update `frontend/app/layout.tsx` to wrap children in `<Providers>`.
   - Add a top-nav `<ConnectButton />` from RainbowKit.

10. Build a minimal landing page at `frontend/app/page.tsx`:
   - Dark background, indigo/violet gradient
   - Title "Silent Council" (huge)
   - Subtitle: "Onchain voting for NITK. Verified voters, secret ballots, public tallies."
   - Primary CTA "Verify with NITK email" → `/verify` (page doesn't exist yet — dead link is fine)
   - Secondary CTA "See live proposals" → `/proposals`
   - Below the fold: three hardcoded proposal `<Card>`s (title + one-line description + fake counts). Static, no animations, no fake stat counters.
   - Footer: GitHub link + "Built at Road to Devcon NITK Surathkal"
   - Mobile responsive

STOP after step 10. I'll deploy to Vercel manually and confirm the URL loads, then we can build the proposal detail page tomorrow.
```

### Step 3 — Day 1 (Wed) prompt: proposal detail page

```
Read @PRD.md §2 (MUST SHIP items 3-4), §7.2, §7.5. Today is Day 1 (Wed) — I have ~4h. Build the proposal detail page + wire real Supabase reads. Don't build category filters, search, deadline countdowns, or the feed page yet.

1. Create `frontend/components/tally-bar.tsx`:
   - Takes props `{ yes: number; no: number; abstain: number }`
   - Renders three coloured divs (green/red/gray) side-by-side, widths as % of total
   - Count labels inline
   - Plain CSS. No Recharts, no Framer Motion. Under 40 lines.

2. Create `frontend/app/proposals/[id]/page.tsx`:
   - Server component if possible
   - Fetches proposal from Supabase: `supabase.from('proposals').select('*').eq('id', params.id).single()`
   - Shows title, description, category badge
   - `<TallyBar yes={p.tally_yes} no={p.tally_no} abstain={p.tally_abstain} />`
   - Three buttons: Yes / No / Abstain
   - Client component wraps the buttons; on click, calls `fetch('/api/vote', { method: 'POST', body: JSON.stringify({ wallet, proposalId: p.onchain_id, choice }) })`
   - Show sonner toast on success (tx hash) or error (per PRD §7.4 error enum)

3. Create `frontend/app/verify/page.tsx`:
   - Client component
   - "Connect wallet" (uses RainbowKit connect button state) + "Verify NITK Email" button
   - On click: for now, POST to `/api/attest` with `{ wallet, zkEmailProof: 'mock', publicInputs: {} }` — teammate's endpoint will accept mock in dev
   - Show success/error status text
   - Add green ✓ badge to top nav if `useReadContract` on `isVerified(address)` returns true (safe-guard: if ABI is empty, render nothing)

Do NOT build /dashboard, /verifiability, /pitch, or /proposals (feed page). Those are cut per PRD §2.

Commit each file as you go: `[FE] tally-bar`, `[FE] proposal detail page`, `[FE] verify page`.
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

## For Krishna (Antigravity + Google One)

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

### Step 3 — Day 0 bootstrap prompt (paste into Antigravity, Tue Aug 18)

```
Read @PRD.md — focus on §7, §9.3 Day 0, §13. Read @AGENTS.md.

I'm the Contracts + Backend engineer for Silent Council. Today is Day 0 (Tue Aug 18). I have ~4 hours. Per PRD §9.3 Day 0, my deliverables by end of today:

1. Supabase project alive with schema per §7.2 + Realtime enabled on `votes` + `proposals`
2. `contracts/SilentCouncil.sol` drafted per §7.3
3. Contract deployed to Base Sepolia via Remix
4. Contract address + ABI pasted into `frontend/lib/contracts.ts`
5. EAS schema created at easscan.org, UID in `.env.example`
6. Everything shared with team lead in shared Notion

I will do the manual browser clicks myself (Supabase setup, Remix deploy, EAS schema creation) following the checklists in @PROMPTS.md "Teammate manual steps." You handle the code: draft the Solidity contract per PRD §7.3, review my paste-back of the address/ABI, and stand by for API route work on Wednesday.

Use Planning Mode. Give me a plan for these 4 hours:
- Which tasks need my manual clicks vs your codegen?
- What order?
- What's your rollback if a step fails?

DO NOT execute code yet. Wait for approval.
```

---

### 🖱️ KRISHNA MANUAL STEPS — click-by-click checklists (Windows)

These are the browser steps Antigravity cannot do for you. Total time: ~30 min if you don't get distracted.

#### 3a. Supabase setup (10 min)

1. Go to [supabase.com](https://supabase.com) → Sign in with GitHub
2. Click **New Project**
3. Fill: name `silent-council`, database password (generate + save to Notion), region `Southeast Asia (Mumbai)` or nearest
4. Click **Create new project**. Wait ~2 min for provisioning.
5. Left sidebar → **SQL Editor** → click **New query**
6. Copy the entire SQL block from PRD §7.2 (starts with `create table proposals`). Paste. Click **Run**. Should say "Success. No rows returned."
7. Left sidebar → **Database** → **Replication** → find the `supabase_realtime` publication → toggle ON for both `proposals` and `votes` tables
8. Left sidebar → **Project Settings** (gear icon) → **API**
9. Copy these three values into the shared Notion:
   - **Project URL** (looks like `https://xxxxxxxxxxx.supabase.co`)
   - **anon public** key (long `eyJ...` string)
   - **service_role** key (different long `eyJ...` string) — **secret, never commit**
10. Also paste the SQL from PRD §9.3 Day 1 seed proposals block. This creates 3 demo proposals so the frontend has something to render.

#### 3b. Remix contract deploy (10 min — do AFTER Antigravity drafts the .sol file)

1. Go to [remix.ethereum.org](https://remix.ethereum.org). Wait for it to load.
2. Left sidebar → **File Explorer** icon → in the `contracts/` folder, click **New File** → name it `SilentCouncil.sol`
3. Paste the contract Antigravity drafted (from your local `contracts/SilentCouncil.sol`)
4. Left sidebar → **Solidity Compiler** icon (looks like a Solidity logo). Set compiler version to **0.8.20**. Click **Compile SilentCouncil.sol**. Should show green ✓. If it errors, copy the whole error → paste into Antigravity → apply the fix → repeat.
5. Left sidebar → **Deploy & run transactions** icon (Ethereum logo).
6. **Environment** dropdown → select **"Injected Provider - MetaMask"**. MetaMask popup appears → click **Next / Connect**. Confirm the account shown is your fresh Base Sepolia account (NOT your mainnet account).
7. Confirm the network at the top says **"Base Sepolia (84532)"**. If it says something else, switch networks in MetaMask first.
8. **Contract** dropdown → select `SilentCouncil`.
9. If the constructor takes arguments (issuer address, initial owner): paste your MetaMask address (the same wallet) into both boxes. Both are just you for this hackathon.
10. Click orange **Deploy** button → MetaMask popup → **Confirm**. Wait ~15 seconds for the tx.
11. Scroll down in Remix → under **Deployed Contracts** → click the copy icon next to the deployed address. **This is your contract address.** Paste into Notion + `frontend/lib/contracts.ts` `SILENT_COUNCIL_ADDRESS`.
12. Go back to Solidity Compiler tab → scroll down → **ABI** section → click clipboard icon. Paste as `SILENT_COUNCIL_ABI` value in `frontend/lib/contracts.ts` (replacing the empty `[]`).
13. Also seed 3 on-chain proposals: expand the deployed contract in Remix → find `createProposal` → paste each title/description/category/deadline (unix timestamp, use [epochconverter.com](https://www.epochconverter.com)) → click write → sign popup. Copy the returned proposalId, use it as the `onchain_id` in Supabase.
14. Commit + push `lib/contracts.ts`. Ping team lead: "contract deployed at 0x…, ABI pushed."

#### 3c. EAS schema (3 min)

1. Go to [base-sepolia.easscan.org/schema/create](https://base-sepolia.easscan.org/schema/create)
2. Connect MetaMask (same account, Base Sepolia)
3. **Schema** field: paste exactly `address wallet, string domain, bytes32 nullifier`
4. **Resolver**: leave blank (`0x0000000000000000000000000000000000000000`)
5. **Revocable**: check the box
6. Click **Create Schema** → MetaMask popup → **Confirm**. Wait ~10s.
7. When it lands, the page shows the schema UID (a `0x...` 64-char hex). Copy it.
8. Paste as `NEXT_PUBLIC_EAS_SCHEMA_UID=0x...` in `.env.example` + Notion. Commit + push.

#### 3d. Vercel env vars (5 min — do this AFTER team lead has deployed the frontend to Vercel)

Team lead will share the Vercel project URL. Once he does:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → click the `silent-council` project → **Settings** → **Environment Variables**
2. Add each of these (from PRD §7.1). For **secret** ones (no `NEXT_PUBLIC_` prefix), only check "Production" + "Preview" scopes; for public ones check all three:
   - `NEXT_PUBLIC_CHAIN_ID` = `84532`
   - `NEXT_PUBLIC_RPC_URL` = `https://sepolia.base.org`
   - `NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS` = your deployed address
   - `NEXT_PUBLIC_EAS_ADDRESS` = `0x4200000000000000000000000000000000000021`
   - `NEXT_PUBLIC_EAS_SCHEMA_UID` = your schema UID
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key (secret)
   - `ISSUER_PRIVATE_KEY` = your Issuer MetaMask account's private key (secret — the second account, not your main one)
   - `NEXT_PUBLIC_ALLOWED_DOMAIN` = `nitk.edu.in`
   - `NEXT_PUBLIC_DOMAIN_SALT` = `silent-council-nitk-v1`
3. Click **Deployments** tab → three dots on the latest deployment → **Redeploy** so the env vars take effect.

**⚠️ Wallet safety:** the `ISSUER_PRIVATE_KEY` is a private key. Anyone with it can sign attestations as you. That's why the Issuer wallet is a fresh MetaMask account with zero real ETH — the worst-case blast radius is somebody spoofs "verified NITK" attestations, not stealing real money.

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

# Silent Council — Lakshay's Combined Aug 19–20 Guide

This is your only frontend checklist for **Wednesday, Aug 19** and **Thursday, Aug 20**.

Your finish line is:

> Connect wallet → verify allowed email → open a real proposal → vote → try again → receive a clear `already_voted` rejection on the deployed Vercel app.

Per PRD §2 and §16, do not build anything outside that loop: no dashboard, pitch page, charts, animations, filters, new packages, or design rewrites.

---

## Important: what the repo currently says

Current merged state: contract commit `e7d359f`, followed by local UI commit `f823b47`:

- `contracts/SilentCouncil.sol` is committed.
- The deployed Base Sepolia address is `0x4838024E8611d4E67fe6B9f6f43559A7e0971130`.
- `frontend/lib/contracts.ts` contains the real ABI and uses that address as its fallback.
- EAS schema UID is committed: `0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518`.
- The pulled dark landing page and RainbowKit header are present.
- Aug 19 UI is committed locally in `f823b47 [FE] ship dark minimal verify and proposal UI`: `/verify`, `/proposals`, `/proposals/[id]`, tally bar, wallet button, verified badge, proposal helpers, and demo proposal data.
- `/api/attest`, `/api/vote`, and `/api/proposals` are still `not_implemented` stubs.
- The local UI still uses demo data/IDs until Supabase seed rows and GET APIs are ready.
- The current local frontend passes ESLint and TypeScript checks.
- Supabase schema, credentials, Realtime, seed rows, Vercel URL, and production environment remain browser/Notion checks.
- RainbowKit still uses an all-zero project ID. MetaMask extension may work, but WalletConnect/mobile must be tested.
- `/how-it-works` is local but outside PRD §2 MUST SHIP. Freeze it.

The UI commit is one commit ahead of `origin/main`; push it before Krishna starts APIs. Do not rewrite or redeploy the contract unless Krishna proves an actual contract blocker.

---

# GATE 0 — Everything that should already be complete before Aug 19

Do not assume an item is done. Tick every box.

## Shared setup

- [ ] You and Krishna can both open the GitHub repo.
- [ ] Krishna is a GitHub collaborator.
- [ ] Both of you have Node.js 20 or 22.
- [ ] Both have fresh MetaMask accounts with no real funds.
- [ ] Base Sepolia is selected and both wallets have test ETH.
- [ ] Both can access the shared Notion page “Silent Council Keys.”
- [ ] No private key or service-role key was sent through WhatsApp or committed.

## Your Aug 18 deliverables

- [x] `frontend/` exists and dependencies are installed.
- [x] Dark landing page is committed.
- [x] RainbowKit wallet control is present in the header.
- [ ] MetaMask browser-extension connection completes; opening the modal alone is not enough.
- [ ] Mobile/WalletConnect is tested. If the all-zero RainbowKit project ID blocks it, create a public Reown project ID and replace the placeholder without adding a package or exposing a secret.
- [x] `frontend/lib/types.ts`, `contracts.ts`, and `supabase.ts` exist.
- [x] API route stubs exist for Krishna.
- [x] Day 0 frontend is on GitHub.
- [ ] Push local UI commit `f823b47` so Krishna can pull it.
- [ ] Vercel project exists with **Root Directory = `frontend`**.
- [ ] Vercel URL loads and is in Notion.

## Krishna's Aug 18 handoff that you must verify

Notion and GitHub must provide:

- [ ] Supabase project URL.
- [ ] Supabase anon key.
- [ ] Supabase service-role key, marked secret.
- [ ] Issuer wallet address and Issuer private key, marked secret.
- [x] Deployed Base Sepolia contract address is committed.
- [x] EAS schema UID is committed.
- [ ] Supabase tables: `proposals`, `votes`, `verified_users`, `sybil_attempts`.
- [ ] Realtime enabled on `proposals` and `votes`.
- [x] `contracts/SilentCouncil.sol` is pushed.
- [x] Full ABI and deployed address are in `frontend/lib/contracts.ts`.

Only the unchecked cloud/secret items still need confirmation. Send:

```text
Krishna — I pulled commit e7d359f. Contract, ABI, deployed address, and EAS UID are visible.
Before API work, please confirm:
1. Supabase schema exists
2. Realtime is enabled for proposals + votes
3. URL, anon key, service-role key, Issuer address, and Issuer key are in Notion
4. Issuer account has Base Sepolia ETH

Then start the Aug 19 API section in your new guide.
```

If any cloud item is missing, finish it together before integration testing.

---

# GATE 1 — Push the merged UI + contract baseline

Open Terminal:

```bash
cd ~/devcon/silent-council
git status --short
git log -2 --oneline
cd frontend
npx tsc --noEmit
npm run lint
cd ..
```

The top commits must be:

```bash
f823b47 [FE] ship dark minimal verify and proposal UI
e7d359f Complete Day 0 setup
```

The two guide files are the only expected untracked files. The frontend commit already exists, so do not create another commit. After checks pass:

```bash
cd ~/devcon/silent-council
git push
```

Text Krishna: `UI + contract baseline pushed. Pull now; HEAD should be f823b47.`

If checks fail, fix only the blocker first. Do not force, reset, or delete local files.

---

# GATE 2 — Put real environment values in the right places

Create or update `frontend/.env.local`. Never commit it.

```bash
# Chain
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org

# Contract
NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS=0x4838024E8611d4E67fe6B9f6f43559A7e0971130
NEXT_PUBLIC_EAS_ADDRESS=0x4200000000000000000000000000000000000021
NEXT_PUBLIC_EAS_SCHEMA_UID=0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518

# Supabase
NEXT_PUBLIC_SUPABASE_URL=<Notion Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Notion anon key>

# Server only
SUPABASE_SERVICE_ROLE_KEY=<Notion service-role key>
ISSUER_PRIVATE_KEY=<Notion Issuer private key>
ZK_EMAIL_API_KEY=<only if Krishna confirms it is required>

# App
NEXT_PUBLIC_ALLOWED_DOMAINS=nitk.edu.in,gmail.com
NEXT_PUBLIC_DOMAIN_SALT=silent-council-nitk-v1
```

Add the same values in Vercel:

1. Project → Settings → Environment Variables.
2. Apply to Production, Preview, and Development.
3. Save.
4. Deployments → latest → Redeploy.

Never prefix `SUPABASE_SERVICE_ROLE_KEY` or `ISSUER_PRIVATE_KEY` with `NEXT_PUBLIC_`.

`frontend/.env.example` still shows a zero contract-address placeholder even though `contracts.ts` has the deployed fallback. Use the real address above in `.env.local` and Vercel. Krishna can update the public example during his next backend commit.

---

# WEDNESDAY, AUG 19 — Real data and frontend/backend handshake

## Wednesday must end with

- [ ] Proposal page renders a real Supabase row.
- [ ] Landing cards link to real Supabase UUIDs.
- [ ] Vote buttons call `/api/vote` per PRD §7.4.
- [ ] Verify page calls `/api/attest`.
- [ ] Required success and error states render clearly.
- [x] ABI and deployed contract address are committed.
- [ ] Local build and Vercel deployment pass.

## Paste this entire block into Cursor

```text
Read @AGENTS.md and @PRD.md. Focus on PRD §2 MUST SHIP, §7, §8.3 Day 1–2, §10, and §16.

I am Lakshay, frontend owner. Today is Wed Aug 19, 2026, and this prompt covers frontend work for Aug 19–20. Inspect the existing implementation before editing and preserve the current visual design.

Repository reality to verify:
- contract commit e7d359f and UI commit f823b47 are both in local main
- the dark landing page and wallet connection exist
- commit f823b47 contains /verify, /proposals, /proposals/[id], tally bar, wallet button, verified badge, and proposal helper files
- local proposal UI currently falls back to fake demo IDs/data
- Krishna owns contracts, frontend/app/api/**, frontend/lib/contracts.ts, and backend integration
- contracts/SilentCouncil.sol is deployed and committed
- frontend/lib/contracts.ts has the full ABI and deployed address 0x4838024E8611d4E67fe6B9f6f43559A7e0971130
- API routes are still stubs

First report:
1. which Aug 19 frontend requirements are complete
2. what is missing
3. whether /api/attest, /api/vote, and GET /api/proposals are stubs
4. whether the all-zero RainbowKit project ID prevents real wallet/mobile connection
5. TypeScript, lint, or build errors

Then implement only missing frontend-owned work:

A. Real proposals
- Preserve and finish the existing local proposal helpers/pages rather than replacing their design.
- Read proposals from Supabase using PRD §7.2.
- Map snake_case rows to Proposal in frontend/lib/types.ts.
- Landing links must use real Supabase UUIDs once seed rows exist.
- Keep demo fallback only for local development or a temporary outage; production must use real rows when configured.
- The current “See live proposals” link points to a missing /proposals route. Point it to the landing proposal section unless a minimal feed already exists; do not spend time building the optional feed.
- Do not create a proposal form.

B. Proposal detail and voting
- Keep and finish the existing /proposals/[id] and frontend/components/tally-bar.tsx.
- Use plain Tailwind/CSS bars; do not install a chart library.
- Show title, description, category, deadline, tally, and Yes/No/Abstain.
- POST exactly { wallet, proposalId, choice } to /api/vote.
- On success use newTally and show a sonner toast with shortened tx hash.
- Handle already_voted, not_verified, proposal_closed, and server_error clearly.
- Disable buttons while pending.
- Ask disconnected users to connect.

C. Verification
- Keep and finish the existing simple /verify page.
- Keep the local verified badge in the site header and use isVerified(address) from the committed contract ABI.
- POST the exact body agreed with Krishna to /api/attest per PRD §7.4.
- Wednesday may use Krishna's documented mock request only for integration testing. Do not invent a mock shape or call it ZK.
- Thursday must switch to real zk.email, or the coordinated OTP fallback from PRD §13.2.
- Handle invalid_proof, wrong_domain, already_verified, and server_error.
- Refetch isVerified(address) after success so the badge updates without reload.
- Say production accepts @nitk.edu.in and the judging demo also accepts Gmail.

D. Mobile and scope
- At 375px: no horizontal scroll or clipped text; vote buttons at least 44px tall.
- No dependencies.
- Do not edit contracts/**, frontend/app/api/**, PRD.md, PROMPTS.md, or AGENTS.md.
- Do not add dashboard, pitch, verifiability, filters, charts, animations, or optional features.

E. Verify
- Run npx tsc --noEmit, npm run lint, and npm run build.
- Fix only errors caused by this work.

Do not commit or push. Stop with:
1. files changed
2. completed requirements
3. exact Krishna-owned blockers
4. exact browser test
5. exact Vercel variables required
```

## Wednesday manual test

```bash
cd ~/devcon/silent-council/frontend
npm run dev
```

At `http://localhost:3000` confirm:

- [ ] Landing loads.
- [ ] Wallet connects on Base Sepolia.
- [ ] Three proposal links open valid pages.
- [ ] Pages use Supabase when configured.
- [ ] Verify reaches `/api/attest`; `not_implemented` means Krishna is blocked.
- [ ] Vote reaches `/api/vote`; `not_implemented` means Krishna is blocked.
- [ ] No red browser crash.
- [ ] Phone width has no horizontal scroll.

Then:

```bash
cd ~/devcon/silent-council
git add frontend
git commit -m "[FE] connect proposal and verify flows"
git push
```

Send Krishna:

```text
Frontend pushed, pull now.
I tested:
- real proposal page: <works/blocked>
- POST /api/attest: <status/error>
- POST /api/vote: <status/error>

I need before Thu:
1. non-stub attest + vote routes
2. exact temporary mock request shape for Wed
3. three Supabase proposal UUIDs mapped to full onchain bytes32 IDs
4. confirmation of real ZK or OTP fallback
```

---

# THURSDAY, AUG 20 — Make the production demo loop work

No redesign. Integration and P0 bug fixes only.

## Five-minute start-of-session call

Confirm:

- `/api/attest` is deployed and non-stub.
- `/api/vote` is deployed and non-stub.
- Three proposals exist onchain and in Supabase.
- Each row has the exact full onchain `bytes32` ID.
- Verification path is real zk.email or OTP fallback.
- All Vercel variables are present.

If ZK is still not working after Krishna's 60-minute cutoff, activate PRD §13.2. Do not spend the day fighting the prover.

## If Krishna activates OTP fallback

Use the route shape Krishna confirms. Intended contract:

- Send: `{ action: "send", email }`
- Verify: `{ action: "verify", email, token, wallet }`
- Domains: `nitk.edu.in,gmail.com`
- Success returns `nullifier`, `issuerSignature`, and `attestationUid`

The UI must state:

> ZK proving is unavailable in this fallback build. Email OTP is used for the demo, so the server temporarily sees the email.

Never describe OTP as zero knowledge.

## Production test — exact order

1. Open Vercel production in an incognito window.
2. Connect a fresh MetaMask account on Base Sepolia.
3. Click Verify and complete real ZK or honest OTP.
4. Confirm the green Verified badge.
5. Open “Extend mess hours to 11 PM?”
6. Record the current Yes count.
7. Vote Yes and approve the wallet/transaction flow.
8. Confirm success toast and tx hash.
9. Confirm Yes increases exactly once.
10. Refresh and confirm the tally remains.
11. Vote again.
12. Confirm a clear `already_voted` message.
13. Confirm Vercel logs have no unhandled error.
14. Repeat the page check on a physical phone.

## Required user-facing messages

- `not_verified` → “Verify your allowed email before voting.”
- `already_voted` → “This verified email has already voted on this proposal.”
- `proposal_closed` → “Voting for this proposal has closed.”
- `wrong_domain` → “Use an @nitk.edu.in email. Gmail is also allowed for this judging demo.”
- `invalid_proof` → “We could not verify this email proof. Please try again.”
- `server_error` → “Something went wrong. Please retry in a moment.”

## Final verification and deploy

```bash
cd ~/devcon/silent-council/frontend
npx tsc --noEmit
npm run lint
npm run build
cd ..
git status --short
git add frontend
git commit -m "[FE] complete verify and vote loop"
git push
```

Wait for Vercel to say Ready, then repeat the production test.

---

# Thursday end-of-day acceptance gate

- [ ] Vercel production URL loads.
- [ ] Wallet connects on Base Sepolia.
- [ ] Real ZK or honestly labelled OTP works.
- [ ] Green Verified badge appears.
- [ ] Three real proposals are reachable.
- [ ] Vote produces a real Base Sepolia tx hash.
- [ ] Tally persists after refresh.
- [ ] Second vote is rejected.
- [ ] Rejection is enforced by contract/nullifier, not only frontend state.
- [ ] 375px layout has no horizontal scroll.
- [ ] Physical phone test passed.
- [ ] Typecheck, lint, and build passed.
- [ ] Code is pushed and Vercel is Ready.

Send Krishna:

```text
Thu P0 checkpoint:
- verify in production: PASS/FAIL
- verified badge: PASS/FAIL
- first vote + tx hash: PASS/FAIL
- tally persists: PASS/FAIL
- second vote rejected: PASS/FAIL
- physical phone: PASS/FAIL
- Vercel deployment: <URL>

Any FAIL becomes Friday's first bug. No new features.
```

If any P0 item fails Thursday night, Friday is emergency bug-fix mode. Do not record the final video or add optional features until the loop passes.

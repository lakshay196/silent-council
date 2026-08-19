# Silent Council — Krishna's Combined Aug 19–20 Guide

This is your only backend/contract checklist for **Wednesday, Aug 19** and **Thursday, Aug 20**.

Your finish line is:

> A deployed Vercel app can verify an allowed email, create the onchain voter record, cast a real Base Sepolia vote, update the tally, and reject a second vote.

You are on the critical path. Do not build optional routes, dashboards, charts, load tests, or custom ZK circuits.

---

## Important: what the repo currently says

Current merged baseline consists of contract commit `e7d359f` plus Lakshay's UI commit `f823b47`:

- `contracts/SilentCouncil.sol` is committed.
- The contract is deployed on Base Sepolia at `0x4838024E8611d4E67fe6B9f6f43559A7e0971130`.
- `frontend/lib/contracts.ts` contains the complete ABI and deployed fallback address.
- EAS schema UID is committed as `0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518`.
- `frontend/app/api/attest/route.ts` is a `not_implemented` stub.
- `frontend/app/api/vote/route.ts` is a `not_implemented` stub.
- `frontend/app/api/proposals/route.ts` is a `not_implemented` stub.
- `frontend/lib/zk-email.ts`, `GET /api/proposals`, and `GET /api/proposals/[id]` are absent.
- Lakshay has merged your contract with his Aug 19 UI and committed it as `f823b47`. Wait for him to push that commit, then pull before API edits.
- `.env.example` has the real EAS UID but still shows a zero contract address; update that public placeholder during the API commit.
- The commit added direct `@x402/*` packages. Do not build x402 features. Keep them only if the installed zk.email SDK/build genuinely requires them; do not add more packages.

The contract handoff is complete. Supabase, secrets, Realtime, Vercel, and seed proposals remain browser/Notion checks.

---

# GATE 0 — Everything that should already be complete before Aug 19

Complete every unchecked item before starting Wednesday's API routes.

## Computer and shared access

- [ ] Git for Windows works.
- [ ] `node -v` prints Node 20 or 22.
- [ ] Antigravity is installed and opens the repo.
- [ ] You accepted Lakshay's GitHub invite.
- [ ] Repo is cloned at `~/Desktop/silent-council`.
- [ ] Shared Notion page “Silent Council Keys” opens.
- [ ] You have Lakshay's production Vercel URL.

## Wallet safety

- [ ] MetaMask is installed.
- [ ] Base Sepolia network is selected.
- [ ] Main test account has Base Sepolia ETH.
- [ ] A separate MetaMask account named `Issuer` exists.
- [ ] Issuer account has enough Base Sepolia ETH to submit server-relayed verification/vote/EAS transactions if the backend uses it as the transaction sender.
- [ ] Only the Issuer private key is in Notion.
- [ ] No seed phrase, private key, or service-role key is in Git, WhatsApp, Discord, or an AI prompt.

## Supabase

- [ ] Project `silent-council` exists.
- [ ] Region is Mumbai or the closest available region.
- [ ] Tables exist: `proposals`, `votes`, `verified_users`, `sybil_attempts`.
- [ ] Unique constraint exists on `(proposal_id, nullifier)` in `votes`.
- [ ] Realtime is enabled on `proposals` and `votes`.
- [ ] Project URL is in Notion.
- [ ] Anon key is in Notion.
- [ ] Service-role key is in Notion and marked secret.

## Contract and EAS

- [x] `contracts/SilentCouncil.sol` is committed and implements the PRD §7.3 surface.
- [x] Contract targets Solidity 0.8.20.
- [x] Contract is deployed on Base Sepolia at `0x4838024E8611d4E67fe6B9f6f43559A7e0971130`.
- [ ] Constructor uses the Issuer address and the intended owner address.
- [ ] Deployed contract address is also copied into Notion.
- [x] Full ABI is in `frontend/lib/contracts.ts`.
- [x] Real fallback address is in `frontend/lib/contracts.ts`.
- [ ] EAS schema exists on Base Sepolia.
- [ ] EAS schema is exactly `address wallet, string domain, bytes32 nullifier`.
- [ ] EAS schema UID is also in Notion.
- [x] EAS schema UID is in `.env.example`.
- [x] Contract code and ABI are pushed to GitHub.
- [ ] Replace the zero contract-address placeholder in `.env.example` with the public deployed address.

Do not regenerate or redeploy the contract during Aug 19 unless an actual integration blocker is proven.

---

# GATE 1 — Confirm the shared baseline

Open Git Bash:

```bash
cd ~/Desktop/silent-council
git status --short
git log -1 --oneline
```

Wait for Lakshay's `UI + contract baseline pushed` message, then run:

```bash
git pull
git log -2 --oneline
```

The top commits must be:

```text
f823b47 [FE] ship dark minimal verify and proposal UI
e7d359f Complete Day 0 setup
```

Text Lakshay before editing API files:

```text
Contract handoff is complete. I am now editing only frontend/app/api/** and backend helper files. I will not rewrite the deployed contract. I will message “pushed, pull” when APIs are ready.
```

Never use force-push, hard reset, or delete Lakshay's frontend files.

---

# CATCH-UP A — Supabase schema, if any table is missing

Supabase → SQL Editor → New query → paste all of this → Run:

```sql
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  onchain_id text unique not null,
  title text not null,
  description text not null,
  category text not null,
  deadline timestamptz not null,
  creator_wallet text not null,
  tally_yes int not null default 0,
  tally_no int not null default 0,
  tally_abstain int not null default 0,
  created_at timestamptz default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references proposals(id) on delete cascade,
  nullifier text not null,
  choice smallint not null check (choice in (0, 1, 2)),
  tx_hash text not null,
  created_at timestamptz default now(),
  unique (proposal_id, nullifier)
);

create table if not exists verified_users (
  wallet text primary key,
  nullifier text unique not null,
  attestation_uid text not null,
  attested_at timestamptz default now()
);

create table if not exists sybil_attempts (
  id uuid primary key default gen_random_uuid(),
  attempted_wallet text,
  reason text,
  created_at timestamptz default now()
);
```

Then:

1. Supabase → Database → Replication.
2. Enable Realtime for `proposals`.
3. Enable Realtime for `votes`.
4. Settings → API.
5. Confirm URL, anon key, and service-role key are in Notion.

Do not paste the service-role key into code.

---

# CONTRACT HANDOFF — Complete; use these exact deployed rules

Do not repeat contract generation or Remix deployment.

Public deployment values:

```text
Chain: Base Sepolia (84532)
SilentCouncil: 0x4838024E8611d4E67fe6B9f6f43559A7e0971130
EAS: 0x4200000000000000000000000000000000000021
EAS schema UID: 0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518
```

The API must match the already-deployed signature logic exactly:

```text
verifyVoter:
messageHash = keccak256(abi.encodePacked(wallet, nullifier))
issuerSignature = EIP-191 personal-sign signature over messageHash

vote:
messageHash = keccak256(abi.encodePacked(proposalId, uint8 choice, nullifier))
issuerSignature = EIP-191 personal-sign signature over messageHash
```

With viem, reproduce Solidity packed encoding using `encodePacked` with the exact types, hash with `keccak256`, then sign that 32-byte hash using the Issuer account. Do not add chain ID or contract address to these payloads: that would be safer for replay protection, but it would not match the deployed bytecode. Record the missing domain separation as post-hackathon technical debt.

Use `account.signMessage({ message: { raw: messageHash } })`. Passing the hex hash as a normal string signs the text `"0x..."` and will fail contract recovery.

Before API coding, manually confirm:

- The Issuer private key in Vercel/Notion corresponds to the `issuer()` address stored in this deployed contract.
- The Issuer account has Base Sepolia ETH if it will relay transactions.
- The EAS schema page resolves the committed UID and shows `address wallet, string domain, bytes32 nullifier`.
- `.env.local` and Vercel use the deployed contract address, not the zero placeholder.

---

# WEDNESDAY, AUG 19 — Implement real API behavior

## Wednesday must end with

- [ ] `POST /api/attest` is not a stub.
- [ ] `POST /api/vote` is not a stub.
- [ ] `GET /api/proposals` returns mapped proposals.
- [ ] `GET /api/proposals/[id]` returns one proposal and recent vote metadata per PRD §7.4.
- [ ] Domain allow-list rejects everything except `nitk.edu.in` and `gmail.com`.
- [ ] Contract calls use the exact signature encoding expected by the deployed contract.
- [ ] Three proposals exist onchain and in Supabase with matching IDs.
- [ ] Routes pass local typecheck/build.
- [ ] Routes are deployed on Vercel.
- [ ] Curl tests produce the locked PRD §7.4 response shapes.

## Paste this entire block into Antigravity

```text
Read @AGENTS.md and @PRD.md. Focus on PRD §2 MUST SHIP, §4 verification sequence and trust model, §7.1–§7.5, §9.3 Day 1–2, §13, and §16.

I am Krishna, contract/backend owner. This prompt covers Aug 19–20. Use Planning Mode and wait for my approval before editing.

Current facts:
- after Lakshay pushes, local main must contain contract commit e7d359f followed by UI commit f823b47
- SilentCouncil is already deployed at 0x4838024E8611d4E67fe6B9f6f43559A7e0971130
- ABI is already in frontend/lib/contracts.ts
- EAS schema UID is 0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518
- do not rewrite or redeploy the contract
- all three API routes are still not_implemented stubs

First inspect:
- contracts/SilentCouncil.sol
- frontend/lib/contracts.ts
- frontend/lib/types.ts
- frontend/lib/supabase.ts
- frontend/app/api/attest/route.ts
- frontend/app/api/vote/route.ts
- frontend/app/api/proposals/route.ts
- frontend/package.json
- frontend/next.config.ts

Report:
1. missing Aug 18 prerequisites
2. confirm these deployed signature payloads:
   - verifyVoter: keccak256(encodePacked(["address","bytes32"], [wallet,nullifier])) then EIP-191 signMessage
   - vote: keccak256(encodePacked(["bytes32","uint8","bytes32"], [proposalId,choice,nullifier])) then EIP-191 signMessage
3. current API stub status
4. any mismatch between the contract and PRD §7.3/§7.4
5. whether the direct @x402 dependencies are genuinely needed by @zk-email/sdk/build; do not use them for product features
6. your file-by-file implementation plan

After I approve, implement only the following:

A. Shared server behavior
- Use TypeScript strict with no any.
- Parse request JSON as unknown and validate/narrow it.
- Validate wallet and transaction addresses with viem.
- Keep secrets server-only.
- Use NEXT_PUBLIC_ALLOWED_DOMAINS split on commas, lowercase, trim, and default to nitk.edu.in,gmail.com.
- Use NEXT_PUBLIC_DOMAIN_SALT for nullifier generation exactly as agreed by the frontend/backend contract.
- Use viem and privateKeyToAccount from viem/accounts; do not add packages.
- Use the deployed contract at 0x4838024E8611d4E67fe6B9f6f43559A7e0971130.
- Wait for transaction receipts before writing success to Supabase.
- Return the exact success/error JSON shapes in PRD §7.4.
- Never log an email, proof, private key, service-role key, signature, or full request body.

B. POST frontend/app/api/attest/route.ts
- Validate wallet, zkEmailProof, and publicInputs.
- Wednesday integration may support an explicitly isolated mock proof path, but only when the request clearly says mock. It must still extract a test email from publicInputs and enforce the domain allow-list. Document the exact mock curl body for Lakshay.
- Do not silently accept empty publicInputs as a valid proof.
- For a valid allowed-domain identity, normalize the email, compute a deterministic bytes32 nullifier using the agreed salt, and ensure changing wallet does not change that email nullifier.
- Reject wrong domains as wrong_domain.
- Reject invalid proof shape as invalid_proof.
- Reject an existing wallet or nullifier as already_verified.
- Produce the exact issuer signature bytes expected by SilentCouncil.verifyVoter.
- Specifically hash Solidity packed types ["address","bytes32"], then EIP-191 sign that hash with the Issuer key.
- Submit or relay the real Base Sepolia verifyVoter transaction and wait for receipt.
- Issue the EAS attestation using NEXT_PUBLIC_EAS_ADDRESS and NEXT_PUBLIC_EAS_SCHEMA_UID if the current architecture supports it. Return the real EAS UID. If EAS issuance is not implemented, do not fake a UID: report it as a blocker before coding.
- Insert verified_users only after onchain success.
- Return { ok: true, nullifier, issuerSignature, attestationUid }.

C. POST frontend/app/api/vote/route.ts
- Validate wallet, proposalId UUID, and choice 0|1|2.
- Look up verified_users by normalized wallet. If absent, return not_verified.
- Look up proposals by Supabase UUID and read its full onchain_id.
- Check deadline before submitting and return proposal_closed when closed.
- Check duplicate vote before submitting, but keep the contract as the final authority.
- Produce the exact issuer signature expected by the deployed vote function, if the contract requires a per-vote signature.
- Specifically hash packed types ["bytes32","uint8","bytes32"], then EIP-191 sign that hash.
- Submit the real SilentCouncil.vote transaction using the full onchain bytes32 proposal ID and wait for receipt.
- Only after receipt: insert votes and update the matching tally column.
- Handle the database unique constraint and contract duplicate-vote revert as already_voted.
- Return { ok: true, txHash, newTally: { yes, no, abstain } }.
- Do not allow a client-supplied nullifier or tally.

D. Proposal reads
- Implement GET in frontend/app/api/proposals/route.ts, sorted by created_at descending.
- Implement GET in frontend/app/api/proposals/[id]/route.ts with the exact PRD §7.4 response: { proposal, recentVotes }.
- Recent votes may include only txHash, choice, and timestamp; never return nullifier or wallet data.
- Map Supabase snake_case fields to the Proposal interface camelCase fields.
- Return { proposals: Proposal[] }.
- Do not implement create-proposal UI.

E. Errors and logging
- Map expected errors to invalid_proof, wrong_domain, already_verified, not_verified, already_voted, proposal_closed, or server_error as specified by PRD §7.4.
- Use appropriate HTTP status codes while preserving the JSON shapes.
- Insert sybil_attempts for invalid_proof, already_voted, and not_verified without storing PII.
- Do not expose raw RPC, Supabase, signature, or stack-trace errors to clients.

F. Scope and verification
- Do not edit frontend pages or components; Lakshay owns them.
- Do not edit or redeploy contracts/SilentCouncil.sol.
- Update the zero NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS placeholder in frontend/.env.example to the public deployed address.
- Do not modify PRD.md, PROMPTS.md, or AGENTS.md.
- Do not write a custom circuit.
- Do not add dependencies.
- Run npx tsc --noEmit, npm run lint, and npm run build from frontend.
- Do not commit or push.

Stop with:
1. files changed
2. exact mock curl request for Wednesday
3. exact Vercel env variables
4. exact SQL/onchain seeding sequence
5. unresolved blockers, especially EAS or signature mismatch
6. manual deployment/test steps
```

## Required Vercel variables

Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_SILENT_COUNCIL_ADDRESS=0x4838024E8611d4E67fe6B9f6f43559A7e0971130
NEXT_PUBLIC_EAS_ADDRESS=0x4200000000000000000000000000000000000021
NEXT_PUBLIC_EAS_SCHEMA_UID=0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<secret service-role key>
ISSUER_PRIVATE_KEY=<secret Issuer key>
ZK_EMAIL_API_KEY=<only if the SDK requires it>
NEXT_PUBLIC_ALLOWED_DOMAINS=nitk.edu.in,gmail.com
NEXT_PUBLIC_DOMAIN_SALT=silent-council-nitk-v1
```

Apply to Production, Preview, and Development. Redeploy after saving.

## Seed proposals correctly

The old sample IDs such as `0x1111...` are not valid full `bytes32` proposal IDs. Do not use them.

### 1. Create all three proposals onchain first

Get a deadline five days from now:

```bash
node -e "console.log(Math.floor(Date.now()/1000) + 5*24*60*60)"
```

In Remix, use `createProposal` three times:

1. `Extend mess hours to 11 PM?`
2. `Ban plastic bottles in hostels?`
3. `Longer library hours during exams?`

Use categories `mess`, `hostel`, and `academic`. Use the generated Unix deadline.

After each transaction:

1. Expand the transaction in Remix.
2. Find the `ProposalCreated` event.
3. Copy the complete 66-character `proposalId` (`0x` plus 64 hex characters).
4. Save the three IDs in Notion.

### 2. Insert those exact IDs into Supabase

Replace every `<...>` before running:

```sql
insert into proposals
  (onchain_id, title, description, category, deadline, creator_wallet)
values
  (
    '<FULL_BYTES32_ID_1>',
    'Extend mess hours to 11 PM?',
    'Students returning late from labs and club work need a later dinner window.',
    'mess',
    now() + interval '5 days',
    '<OWNER_WALLET>'
  ),
  (
    '<FULL_BYTES32_ID_2>',
    'Ban plastic bottles in hostels?',
    'Replace single-use plastic bottles with refill stations and reusable bottles.',
    'hostel',
    now() + interval '5 days',
    '<OWNER_WALLET>'
  ),
  (
    '<FULL_BYTES32_ID_3>',
    'Longer library hours during exams?',
    'Keep the library open around the clock during examination weeks.',
    'academic',
    now() + interval '5 days',
    '<OWNER_WALLET>'
  )
returning id, onchain_id, title;
```

Send the returned Supabase UUIDs and titles to Lakshay. His URLs use the UUID; your vote route translates that UUID to `onchain_id`.

## Wednesday curl tests

Use the exact mock body Antigravity reports. It should resemble:

```bash
export APP_URL="https://<your-vercel-project>.vercel.app"

curl -i -X POST "$APP_URL/api/attest" \
  -H "Content-Type: application/json" \
  --data '{"wallet":"<TEST_WALLET>","zkEmailProof":"mock","publicInputs":{"email":"<YOUR_GMAIL>"}}'
```

Wrong-domain test must fail:

```bash
curl -i -X POST "$APP_URL/api/attest" \
  -H "Content-Type: application/json" \
  --data '{"wallet":"<SECOND_TEST_WALLET>","zkEmailProof":"mock","publicInputs":{"email":"person@yahoo.com"}}'
```

Proposal list:

```bash
curl -i "$APP_URL/api/proposals"
```

Proposal detail:

```bash
curl -i "$APP_URL/api/proposals/<SUPABASE_UUID>"
```

Vote after successful verification:

```bash
curl -i -X POST "$APP_URL/api/vote" \
  -H "Content-Type: application/json" \
  --data '{"wallet":"<VERIFIED_TEST_WALLET>","proposalId":"<SUPABASE_UUID>","choice":0}'
```

Run the same vote command again. It must return `already_voted`.

## Wednesday verify and push

```bash
cd ~/Desktop/silent-council/frontend
npx tsc --noEmit
npm run lint
npm run build
cd ..
git status --short
git add frontend/app/api frontend/lib frontend/.env.example
git commit -m "[BE] implement attest and vote APIs"
git push
```

Review `git status` before committing. Do not commit `.env.local` or any secret.

Text Lakshay:

```text
Backend pushed, pull now.
- POST /api/attest: PASS/FAIL
- POST /api/vote first vote: PASS/FAIL
- second vote already_voted: PASS/FAIL
- GET /api/proposals: PASS/FAIL
- GET /api/proposals/[id]: PASS/FAIL
- three Supabase UUIDs: in Notion
- full onchain IDs: in Notion
- exact Wed mock shape: in my message
- EAS UID is real: YES/NO

Tomorrow's verification path: real zk.email / OTP fallback.
```

---

# THURSDAY, AUG 20 — Real ZK or an honest OTP fallback

## Hard timebox

Spend at most **60 minutes** making the installed `@zk-email/sdk` path work. Ask Antigravity to inspect the installed SDK version, its TypeScript declarations, and official examples. Do not guess method names and do not write a custom circuit.

If the real proof path is still broken at 60 minutes, activate PRD §13.2 with Lakshay immediately.

## Real ZK paste-in prompt

```text
Read @AGENTS.md and @PRD.md §4, §7.4, §9.3 Day 2, §13.1–§13.2, and §16.

Today is Thu Aug 20, 2026. Replace Wednesday's mock proof acceptance with real @zk-email/sdk verification.

Before editing:
1. inspect the installed @zk-email/sdk version and its TypeScript declarations
2. inspect official package examples available in the package/repository
3. identify the exact supported registry blueprint for a Gmail domain proof
4. show the client proof shape and server verification call
5. explain how the verified email/domain is extracted from authenticated public inputs

Then implement the smallest working path:
- no custom circuit
- accept only nitk.edu.in and gmail.com
- derive the nullifier from the verified normalized email plus configured salt
- never log or persist the email
- preserve the PRD §7.4 response shape
- remove or disable production mock acceptance
- keep all private keys server-only
- run typecheck, lint, and build

Do not edit Lakshay's frontend. Stop and give him the exact request payload his /verify page must send.

If the installed SDK cannot support this within 60 minutes, stop. Do not keep experimenting. Report the precise blocker so we activate the OTP fallback.
```

## OTP fallback contract, only if ZK is blocked

This fallback is authorized by PRD §13.2. It is **not zero knowledge**, and both the UI and pitch must say so.

Use the existing Supabase Auth email OTP capability so no new dependency or email-service account is required.

Coordinate this request/response shape with Lakshay before editing:

```text
POST /api/verify-otp

Send body:
{ "action": "send", "email": "student@gmail.com" }

Send success:
{ "ok": true, "phase": "code_sent" }

Verify body:
{
  "action": "verify",
  "email": "student@gmail.com",
  "token": "123456",
  "wallet": "0x..."
}

Verify success:
{
  "ok": true,
  "nullifier": "0x...",
  "issuerSignature": "0x...",
  "attestationUid": "0x..."
}

Error:
{
  "ok": false,
  "error": "invalid_code" | "wrong_domain" | "already_verified" | "server_error",
  "message": "..."
}
```

Paste into Antigravity:

```text
Real @zk-email/sdk verification exceeded the 60-minute cutoff. Activate the PRD §13.2 OTP fallback using existing @supabase/supabase-js and Supabase Auth email OTP. Do not install a package.

First confirm the exact Supabase JS calls for:
1. sending an email OTP
2. verifying the six-digit email token

Implement POST frontend/app/api/verify-otp/route.ts with this coordinated body:
- send: { action: "send", email }
- verify: { action: "verify", email, token, wallet }

Requirements:
- allow only domains from NEXT_PUBLIC_ALLOWED_DOMAINS
- normalize email only after OTP proves ownership
- compute the same deterministic nullifier as the attest path
- call the same onchain verifyVoter and EAS attestation helpers
- insert verified_users only after onchain success
- never log or persist the raw email or OTP
- add basic per-email/IP abuse protection using the smallest available mechanism; if robust rate limiting needs a new service, document that limitation instead of adding a dependency
- return the agreed fallback JSON shapes
- keep the ZK route present but do not claim OTP is ZK
- run typecheck, lint, and build

Do not edit frontend components. Give Lakshay the exact two requests and all error names.
```

In Supabase, confirm the Auth email template displays `{{ .Token }}` so the user receives a code rather than only a magic link.

## Thursday end-to-end test with Lakshay

Test on the production Vercel URL:

1. Fresh wallet connects on Base Sepolia.
2. Allowed Gmail or NITK email verifies.
3. `verified_users` receives one row without email PII.
4. Contract `isVerified(wallet)` returns true.
5. Real EAS UID is returned and resolvable.
6. First vote creates a Base Sepolia transaction.
7. `votes` receives one row.
8. Correct proposal tally increments exactly once.
9. Refresh preserves the tally.
10. Second vote returns `already_voted`.
11. A different wallet using the same verified email/nullifier cannot bypass the duplicate protection.
12. Yahoo/Outlook is rejected as `wrong_domain`.
13. Invalid choice such as `3` is rejected.
14. Missing wallet is rejected without a server crash.
15. Vercel logs contain no email, proof, key, or unhandled stack trace.

## Final verification and push

```bash
cd ~/Desktop/silent-council/frontend
npx tsc --noEmit
npm run lint
npm run build
cd ..
git status --short
git add frontend/app/api frontend/lib frontend/.env.example
git commit -m "[BE] complete production voting loop"
git push
```

Do not commit `.env.local`.

---

# Thursday end-of-day acceptance gate

Do not say “done” unless all are true:

- [ ] Contract address and ABI in Git match the deployed Base Sepolia contract.
- [ ] Supabase schema exists.
- [ ] Three proposal UUIDs map to three full onchain `bytes32` IDs.
- [ ] Real ZK works, or OTP fallback is deployed and honestly labelled.
- [ ] Production mock proof acceptance is removed or disabled.
- [ ] Allowed-domain check works.
- [ ] Wrong-domain check works.
- [ ] Onchain voter verification works.
- [ ] EAS UID is real, not a placeholder.
- [ ] First vote returns a real tx hash.
- [ ] Tally persists.
- [ ] Second vote is rejected by contract/nullifier logic.
- [ ] Same identity cannot bypass by switching wallets.
- [ ] No email PII is stored in Supabase.
- [ ] No secrets or PII appear in logs or Git.
- [ ] Typecheck, lint, and build pass.
- [ ] Code is pushed and Vercel deployment is Ready.

Send Lakshay:

```text
Thu P0 backend checkpoint:
- production verification: ZK / honest OTP / FAIL
- allowed-domain enforcement: PASS/FAIL
- contract isVerified: PASS/FAIL
- real EAS UID: PASS/FAIL
- first vote tx: PASS/FAIL
- tally update: PASS/FAIL
- second vote rejected: PASS/FAIL
- wallet-swap duplicate test: PASS/FAIL
- Vercel deployment: <URL>

Any FAIL becomes Friday's first bug. No new features.
```

If any P0 item is still failing Thursday night, Friday is emergency bug-fix mode. No optional backend work, Basescan verification, or refactoring.

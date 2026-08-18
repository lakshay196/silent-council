# Silent Council — QUICKSTART

**Read this first. Then PRD.md.**

---

## What we're actually building

The **90-second demo loop**, nothing else:

**Verify NITK email → open a proposal → vote → try to vote again → get rejected.**

That's the whole product. If it's not in that sentence, it's cut (see PRD §2 "CUT" list).

---

## Time budget (be honest with yourself)

| Day | Hours | Focus |
|---|---|---|
| **Tue Aug 18** | ~4h (from ~1 PM) | Setup + scaffold + deploy empty app to Vercel |
| **Wed Aug 19** | ~4h | One proposal page renders real data, vote button exists |
| **Thu Aug 20** | ~4h | End-to-end demo loop works in prod. This is the P0 day. |
| **Fri Aug 21** | ~4h | 90s Loom video + 6-slide Canva deck. **No new features.** |
| **Sat Aug 22** | ~10h | Polish, README, SUBMIT by 5 PM, rehearse, buffer |
| **Sun Aug 23** | 0h | Judging day. Only touch it if judges flag something. |

**Total: ~26h each, ~52h combined.** That's the real budget. The 900-line PRD used to assume 50h each — it's been rewritten for this reality.

---

## Can my teammate pure-vibecode this? (Straight answer)

**Mostly yes**, with 9 clicks he must do himself. Antigravity will write every line of Solidity, every API route, every SQL statement, and debug pasted errors. It cannot:

1. Install MetaMask, add Base Sepolia network
2. Claim faucet ETH
3. Sign up Supabase & create a project
4. Paste schema SQL & click Run in Supabase SQL Editor
5. Toggle Realtime on tables (Database → Replication)
6. Copy Supabase keys from Settings → API into env vars
7. Open Remix, paste the `.sol`, Compile, Deploy, sign MetaMask popup, copy the deployed address
8. Create EAS schema at easscan.org (sign MetaMask popup)
9. Paste env vars into Vercel Project Settings

Every one of those is copy-paste with zero code understanding required. Click-by-click checklists live in `PROMPTS.md` → "Teammate manual steps." Total time for all 9: **~30 min**.

**If he freezes:** you screen-share and click through with him in 15 min. If he ghosts entirely: fallback in PRD §13.6 (you take over backend, Cursor writes the API routes, we drop the smart contract and use Supabase-only voting). We lose "onchain" credibility, we keep the demo.

The only real danger is wallet safety: he must use a **fresh MetaMask account** with only test ETH. Never his mainnet account, never his real seed phrase.

---

## What YOU (Team Lead / Lakshay) do RIGHT NOW (next 60 min)

### 1. Read the rewritten PRD (15 min)

Focus on **§0, §2, §5, §7, §8, §11**. Skip the rest for now — you can come back to it.

### 2. Create the fresh repo (10 min)

- [github.com/new](https://github.com/new) → name `silent-council`, public, empty
- Then locally:

```bash
mkdir -p ~/devcon/silent-council
cd ~/devcon/silent-council
git init
git remote add origin git@github.com:<your-username>/silent-council.git
cp /Users/lakshay/devcon/ZKAttestify-Sp1-verifier/PRD.md .
cp /Users/lakshay/devcon/ZKAttestify-Sp1-verifier/AGENTS.md .
cp /Users/lakshay/devcon/ZKAttestify-Sp1-verifier/PROMPTS.md .
cp /Users/lakshay/devcon/ZKAttestify-Sp1-verifier/QUICKSTART.md .
git add .
git commit -m "docs: PRD, agents, prompts, quickstart"
git branch -M main
git push -u origin main
```

Then GitHub → Settings → Collaborators → invite teammate.

### 3. Send teammate this exact message (2 min)

```
Bro, sending you the `silent-council` repo invite.

Read this in order, takes ~30 min:
1. Accept the GitHub invite, clone the repo
2. Read PRD.md sections 0, 2, 5, 7, 9, 13 (skip the rest for now)
3. Read the "Teammate manual steps" section in PROMPTS.md
4. Open Antigravity in the silent-council folder
5. Copy the "For Teammate (Antigravity)" section from PROMPTS.md and paste as your first message

Your job today (~4h): Supabase alive + a Solidity contract deployed to Base Sepolia + the address in the repo. Full checklist in PRD §9.3 Day 0.

Time budget for the week: 4h/day Tue-Fri, 10h Saturday. Submit deadline: Sat Aug 22 5 PM.

Ping me when you need a wallet setup screen-share. Otherwise, one message end-of-day: done / doing / blocked.

Notion for keys/URLs (never paste in WhatsApp): <you create + share>
```

### 4. §5 setup (15 min)

Vercel account, MetaMask + Base Sepolia, faucet ETH, shared Notion. Skip the custom domain.

### 5. Open Cursor in `silent-council/` and paste the Day 0 prompt (20 min for prompt + Cursor time)

From `PROMPTS.md` → "For Team Lead (Cursor Pro)" → Step 2. Paste into Cursor Composer. Approve each step. STOP after the scaffold + landing skeleton, ping me if anything fails.

---

## What your teammate does RIGHT NOW (next 60 min)

Full plan in PRD §9.3 Day 0. In short:

1. Accept GitHub invite, clone
2. Read PRD §7, §9, §13
3. Copy the "For Teammate" bootstrap prompt from PROMPTS.md into Antigravity
4. Do §5 setup (~15 min)
5. Follow the click-by-click **"Teammate manual steps"** in PROMPTS.md — Supabase project + schema, contract deploy via Remix, EAS schema creation
6. Push contract address + ABI to `frontend/lib/contracts.ts`
7. Ping you with a "done" message + everything in the shared Notion

---

## The 4-day sprint at a glance

```
DAY 0 (Tue Aug 18, ~4h)   — Skeleton on Vercel + contract deployed
DAY 1 (Wed Aug 19, ~4h)   — Proposal page renders real data
DAY 2 (Thu Aug 20, ~4h)   — Demo loop works in prod (P0)
DAY 3 (Fri Aug 21, ~4h)   — Video + slides. No new features.
DAY 4 (Sat Aug 22, ~10h)  — SUBMIT by 5 PM
Sun Aug 23                — Judging day
```

Full daily schedules: PRD §8.3 (you) and §9.3 (teammate).

---

## Two check-ins per day, not five

Text in shared Notion / chat, 3 questions each:
1. Done since last check-in?
2. Doing now?
3. Blocked?

Times: **lunchtime + end of day.** That's it. You both have 4-hour days; more standups just eat into building.

Full sync schedule: PRD §10.

---

## Emergency contacts

- **Teammate silent for >12h** → phone call
- **Teammate falls sick** → PRD §13.6 fallback: you take over backend, drop smart contract, Supabase-only voting
- **You fall sick** → teammate handles frontend polish with Antigravity + AGENTS.md + PRD
- **zk.email breaks** → PRD §13.2 OTP fallback (ship it Thursday if ZK is still fighting you)
- **Vercel breaks last minute** → PRD §13.4 (local + ngrok tunnel)

---

## The one rule that matters

**Submit on Saturday Aug 22 by 5 PM, no matter what.** A partial demo that shows verify → vote → double-vote-rejected beats a "polished" app that isn't submitted.

If Fri 6 PM the app is buggy: freeze features, spend Sat polishing what works. Kill anything from PRD §2 "SHOULD SHIP" that isn't stable. The only thing judges score is what they can click on.

---

Now read `PRD.md`.

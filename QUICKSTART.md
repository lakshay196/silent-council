# Silent Council — QUICKSTART

**Lost? Read only your personal guide:**

- **Lakshay (Mac):** `docs/LAKSHAY_SETUP.md`
- **Krishna (Windows):** `docs/KRISHNA_SETUP.md`

Ignore the rest of this file until those are done.

---

## What we're actually building

The **90-second demo loop**, nothing else:

**Verify NITK email → open a proposal → vote → try to vote again → get rejected.**

Pitch stays NITK. Demo also allows **Gmail** (`NEXT_PUBLIC_ALLOWED_DOMAINS=nitk.edu.in,gmail.com`) because we are not NITK students. Judges hear one honest sentence; we verify with Gmail on camera.

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

## Can Krishna pure-vibecode this? (Straight answer)

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

Every one of those is copy-paste with zero code understanding required. Click-by-click checklists live in `docs/KRISHNA_SETUP.md` (Windows) and `PROMPTS.md` → "Krishna manual steps." Total time for all 9: **~30 min**.

**If Krishna freezes:** you screen-share and click through with him in 15 min. If he ghosts entirely: fallback in PRD §13.6 (you take over backend, Cursor writes the API routes, we drop the smart contract and use Supabase-only voting). We lose "onchain" credibility, we keep the demo.

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

Then GitHub → Settings → Collaborators → invite Krishna.

### 3. Send Krishna this exact message (2 min)

```
Krishna, sending you the `silent-council` repo invite.

Your full Windows setup guide is in the repo: docs/KRISHNA_SETUP.md
Read that first — it has every click spelled out.

Quick version:
1. Accept the GitHub invite
2. Clone: git clone https://github.com/lakshay196/silent-council.git
3. Open the silent-council folder in Antigravity
4. Open PROMPTS.md → "For Krishna (Antigravity)" → paste Step 3 as your first message to Antigravity

Your job today (~4h): Supabase alive + contract deployed to Base Sepolia + address in the repo.

Time budget: 4h/day Tue-Fri, 10h Saturday. Submit: Sat Aug 22 5 PM.

End-of-day message: done / doing / blocked.

Notion for keys (never WhatsApp): <paste your Notion link>
```

### 4. §5 setup (15 min)

Vercel account, MetaMask + Base Sepolia, faucet ETH, shared Notion. Skip the custom domain.

### 5. Open Cursor in `silent-council/` and paste the Day 0 prompt (20 min for prompt + Cursor time)

From `PROMPTS.md` → "For Team Lead (Cursor Pro)" → Step 2. Paste into Cursor Composer. Approve each step. STOP after the scaffold + landing skeleton, ping me if anything fails.

---

## What Krishna does RIGHT NOW (next 60 min)

Full plan: **`docs/KRISHNA_SETUP.md`** (Windows, step-by-step). Short version:

1. Accept GitHub invite, clone repo
2. Read `docs/KRISHNA_SETUP.md` end to end
3. Copy the Krishna bootstrap prompt from PROMPTS.md into Antigravity
4. Do §5 setup (~15 min)
5. Supabase + Remix deploy + EAS schema (checklists in KRISHNA_SETUP.md)
6. Push contract address + ABI to `frontend/lib/contracts.ts`
7. Ping Lakshay: "done" + everything in shared Notion

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

Full daily schedules: PRD §8.3 (Lakshay) and §9.3 (Krishna).

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

- **Krishna silent for >12h** → phone call
- **Krishna falls sick** → PRD §13.6 fallback: Lakshay takes over backend, drop smart contract, Supabase-only voting
- **Lakshay falls sick** → Krishna handles frontend polish with Antigravity + AGENTS.md + PRD
- **zk.email breaks** → PRD §13.2 OTP fallback (ship it Thursday if ZK is still fighting you)
- **Vercel breaks last minute** → PRD §13.4 (local + ngrok tunnel)

---

## The one rule that matters

**Submit on Saturday Aug 22 by 5 PM, no matter what.** A partial demo that shows verify → vote → double-vote-rejected beats a "polished" app that isn't submitted.

If Fri 6 PM the app is buggy: freeze features, spend Sat polishing what works. Kill anything from PRD §2 "SHOULD SHIP" that isn't stable. The only thing judges score is what they can click on.

---

Now read `PRD.md`.

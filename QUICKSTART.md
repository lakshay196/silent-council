# Silent Council — QUICKSTART

**For you and your teammate. Read this first. Then read PRD.md.**

---

## What just happened

I wrote 4 files at your repo root:

1. **`PRD.md`** — the master 900-line Product Requirements Document. Both of you read this once, cover to cover, before writing any code.
2. **`AGENTS.md`** — machine-readable rules for AI IDEs. Antigravity reads this automatically. Copy to fresh `silent-council` repo.
3. **`PROMPTS.md`** — literal starter prompts each of you paste into your AI IDE. Also includes daily kickoff prompts and stuck-mode prompts.
4. **`QUICKSTART.md`** — this file.

---

## What you (Team Lead / Lakshay) do RIGHT NOW (next 90 minutes)

### 1. Read PRD.md end to end (30 min)

Do NOT skim. This is your project bible for 4 days. Every timeline, every deliverable, every fallback is in there.

### 2. Create the fresh repo (10 min)

- Go to [github.com/new](https://github.com/new)
- Repo name: `silent-council`
- Public
- No README, no gitignore, no license (you'll add)
- Create

Then, on your machine:

```bash
mkdir -p ~/devcon/silent-council
cd ~/devcon/silent-council
git init
git remote add origin git@github.com:<your-username>/silent-council.git
# Copy the docs from the SP1 repo:
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
Bro, I'm sending you the repo invite for `silent-council`.

Before you write any code:
1. Accept the GitHub invite
2. Clone the repo
3. Read `PRD.md` end to end. This is our spec for the next 4 days.
4. Read `AGENTS.md` and `PROMPTS.md`.
5. Read PRD §9 twice — that's your role.
6. Open Antigravity in the repo folder
7. Copy the "For Teammate (Antigravity + Google One)" section from PROMPTS.md and paste as your first message
8. Follow the Day 0 timeline in PRD §9.3

I'll check in at 4 PM, 8 PM, and 11 PM today. Ping me anytime.

Our deadline is Aug 22 night. Submission Aug 22. Buffer day Aug 23.

Let's win this.
```

### 4. Complete §5 setup (30 min)

Follow PRD §5 for team lead prereqs. Vercel account, MetaMask, Base Sepolia, faucet ETH, domain (optional).

### 5. Open Cursor in `silent-council/` and paste the bootstrap prompt (10 min)

From `PROMPTS.md` → "For Team Lead (Cursor Pro)" → "Step 2 — First-day kickoff prompt". Paste into Cursor Composer.

Cursor will scaffold the Next.js app + install deps + set up shadcn. Approve each step. **Then STOP and ping me if anything fails.**

---

## What your teammate does RIGHT NOW (next 90 minutes)

He follows PRD §9.3 Day 0 timeline. In short:

1. Accept GitHub invite, clone
2. Read PRD.md
3. Copy Antigravity bootstrap prompt from PROMPTS.md
4. Do §5 setup: MetaMask, Base Sepolia, faucet, Supabase account
5. Create Supabase project, run schema SQL from PRD §7.2
6. Send Supabase credentials to you securely (Notion, not WhatsApp)
7. Draft SilentCouncil.sol with Antigravity + Planning Mode
8. Deploy via Remix to Base Sepolia
9. Create EAS schema at [base-sepolia.easscan.org/schema/create](https://base-sepolia.easscan.org/schema/create)
10. Update contracts.ts and .env.example with the addresses/UIDs
11. Ping you when done

---

## The 4-day sprint at a glance

```
DAY 0 (Tue Aug 18, 5h effective)   — Setup + skeletons + first deploy
DAY 1 (Wed Aug 19, 10h)            — Contract live, verify flow works
DAY 2 (Thu Aug 20, 10h)            — Voting works end-to-end, polish
DAY 3 (Fri Aug 21, 10h)            — Pitch, demo video, bug bash
DAY 4 (Sat Aug 22, 10h)            — SUBMIT + rehearse + buffer
Sun Aug 23                          — Judging day (only fixes if flagged)
```

Full daily schedules in PRD §8.3 (you) and §9.3 (teammate).

---

## Daily checkpoint schedule (memorize)

| When | Action |
|---|---|
| Every morning 9 AM | 30-min standup on WhatsApp — 3 questions each: done / doing / blocked |
| Every day 2 PM | Silent check — everyone still on track? |
| Every day 6 PM | Sync — teammate's daily API deliverable should be live by now |
| Every day 10 PM | End-of-day summary in team chat, commit everything |

Full sync schedule in PRD §10.

---

## Emergency contacts

- **Teammate not responding for >4 hours** → phone call
- **Teammate falls sick** → you take over contract via Remix + rely on §13.6 fallback (Supabase-only mode)
- **You (team lead) falls sick** → teammate takes over frontend using Antigravity + PRD as reference
- **Both stuck on a technical block** → post on the hackathon's WhatsApp/Discord, use the workshops
- **zk.email broken** → §13.2 email OTP fallback
- **Vercel broken** → run local + ngrok, per §13.4

---

## The one rule that matters

**Ship on Aug 22 night, no matter what.** A broken demo is better than no demo. A partial product is better than a perfect one that's not submitted.

If by Friday 6 PM the app is buggy, freeze features and spend Saturday polishing what works. If the polls don't work, remove them. If the sybil counter doesn't work, remove it. Ship the core loop: verify → propose → vote → tally → sybil-reject.

That's the demo. That's the win.

---

Now read `PRD.md`.

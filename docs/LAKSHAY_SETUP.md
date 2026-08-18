# Silent Council — Lakshay's Guide (Mac)

**Hey Lakshay.** Slow down. You only have **two jobs today.** Everything else can wait.

---

## The two folders (this is why you're lost)

You currently have two folders. Only one is the real project.

| Folder | What it is | Do you code here? |
|---|---|---|
| `~/devcon/ZKAttestify-Sp1-verifier` | Friend's leftover SP1 repo. We only used it to *write* the docs. | **No. Ignore it.** |
| `~/devcon/silent-council` | **Your actual hackathon repo.** This is on GitHub. | **Yes. Always.** |

**From now on:** open Cursor in `~/devcon/silent-council` only.

If this Cursor window is still in the SP1 folder: **File → Open Folder → `silent-council`**.

---

## Git: when Krishna pulls (read this)

Git is a shared Google Drive for code. **Push** = upload. **Pull** = download.

**Krishna does not pull after every keystroke.** He pulls when **you have pushed** and he is about to work.

| When | Who | What |
|---|---|---|
| You finished a Cursor session and ran `git push` | You | WhatsApp: **"pushed, pull"** |
| Krishna sits down to code (start of his 4h) | Krishna | `git pull` **first** |
| Krishna finished and pushed | Krishna | WhatsApp: **"pushed, pull"** |
| You sit down again | You | `git pull` **first** |

If nobody new was pushed, pull does nothing — that's fine.

**You (Mac), in Terminal:**

```bash
cd ~/devcon/silent-council
git pull
# ... Cursor works, then:
git add .
git commit -m "[FE] what changed"
git push
```

Then text Krishna: `pushed, pull`

**If `git push` says rejected:** you forgot to pull. Run `git pull` then `git push` again.

---

## Are the docs on GitHub? Yes.

Krishna can already see them here (no extra pull needed if he clones now):

- Repo: https://github.com/lakshay196/silent-council
- His guide: https://github.com/lakshay196/silent-council/blob/main/docs/KRISHNA_SETUP.md
- Your guide: https://github.com/lakshay196/silent-council/blob/main/docs/LAKSHAY_SETUP.md

If he cloned **before** we added the guide, he runs this in Git Bash:

```bash
cd Desktop/silent-council
git pull
```

Then he opens `docs/KRISHNA_SETUP.md`.

---

## What each file is (ignore most of them)

| File | Who reads it | When |
|---|---|---|
| `docs/LAKSHAY_SETUP.md` | **You** | Today. This is your only checklist. |
| `docs/KRISHNA_SETUP.md` | **Krishna** | Today. His only checklist. |
| `QUICKSTART.md` | Both | 2-min overview. Optional. |
| `PROMPTS.md` | Both | Only when you paste a prompt into Cursor / Antigravity. |
| `PRD.md` | Both | Spec. Don't read it cover to cover. Cursor already knows it. |
| `AGENTS.md` | The AIs | Auto-read. You don't open this. |

That's it. You do **not** need to memorize PRD.md.

---

## Split of work (simple)

```
YOU (Lakshay)                    KRISHNA
─────────────                    ───────
Website the judge sees           Stuff behind the website
- landing page                   - Supabase (database)
- wallet connect                 - Solidity contract
- verify page                    - API routes (/api/attest, /api/vote)
- proposal + vote buttons        - EAS schema
- Vercel deploy + pitch video
```

You cannot finish without his keys. He cannot finish without your Vercel URL. Work in parallel.

---

## TODAY (Tue) — only 5 things

Do these in order. Stop when they're done. Close the laptop.

### 1. Invite Krishna on GitHub (2 min)
https://github.com/lakshay196/silent-council/settings/access → Add people → his GitHub username.

### 2. Create a Notion page (3 min)
New page: **Silent Council Keys**. Share it with Krishna. Never paste keys in WhatsApp.

### 3. Send Krishna this WhatsApp (1 min)

```
Krishna — your guide is here:
https://github.com/lakshay196/silent-council/blob/main/docs/KRISHNA_SETUP.md

1. Accept the GitHub invite
2. Git Bash:
   cd Desktop
   git clone https://github.com/lakshay196/silent-council.git
   cd silent-council
3. Open that folder in Antigravity
4. Follow KRISHNA_SETUP.md from Step 1

Notion for keys: <paste your Notion link>

When Step 10 is done, message me.
```

### 4. Your personal setup (15 min)
- [ ] Vercel account — https://vercel.com → sign in with GitHub
- [ ] MetaMask — add Base Sepolia on chainlist.org
- [ ] Faucet ETH — https://www.alchemy.com/faucets/base-sepolia (fresh account, test ETH only)

### 5. Scaffold the website (the actual coding today)

1. **File → Open Folder** in Cursor → pick `~/devcon/silent-council`
2. Open `PROMPTS.md`
3. Copy **Step 2 — Day 0 kickoff prompt** (the big code block under "For Team Lead")
4. Paste it into Cursor chat / Composer
5. Approve each step. Do **not** install framer-motion / confetti / recharts.
6. When it stops, in Terminal:

```bash
cd ~/devcon/silent-council
git add .
git commit -m "[FE] scaffold frontend + landing"
git push
```

7. Go to https://vercel.com/new → import `silent-council` → **Root Directory = `frontend`** → Deploy
8. Paste the live URL into Notion

**That's all of Tuesday.** Don't build `/verify` or voting yet.

---

## After today — one sentence per day

| Day | You do | You wait for from Krishna |
|---|---|---|
| **Wed** | Build `/proposals/[id]` + `/verify` pages. Ugly is fine. | Supabase keys + contract address in Notion |
| **Thu** | Wire Vote button to `/api/vote`. Test: vote → try again → rejected. | `/api/attest` and `/api/vote` working |
| **Fri** | Record 90s Loom + 6 Canva slides. **No new features.** | Bugfixes + seed proposals |
| **Sat** | Polish, README, **submit Devfolio by 5 PM** | Sit with you, fix last bugs |

If Krishna hasn't sent keys by **tonight**, ping him. If still missing Wednesday morning, screen-share and do Supabase together.

---

## What Cursor should be open on

Always: **`silent-council`**, not the SP1 repo.

Daily prompt: `PROMPTS.md` → "Step 4 — Daily kickoff" — fill in today's date and paste.

---

## If you're stuck

- Cursor garbage → reject, paste a smaller ask ("only the landing page, no extra files")
- Vercel build fail → missing env var 95% of the time
- Don't know what to build → look at the table above for **today's date**. One row. That's it.

You are not supposed to understand every file. You click, Cursor writes, you deploy.

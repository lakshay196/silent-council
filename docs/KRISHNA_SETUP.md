# Silent Council — Krishna's Setup Guide (Windows)

**Hey Krishna.** Lakshay sent you this. Follow every step in order. Total time: ~45–60 min.

If you get stuck for more than 15 minutes → call Lakshay, screen share.

---

## STEP 1 — Install the tools (15 min)

Open your browser and install these:

### 1. Git for Windows
- Go to https://git-scm.com/download/win
- Click the big download button → run the installer
- Click **Next** on everything, keep all defaults
- **Restart your PC** when done

### 2. Node.js
- Go to https://nodejs.org
- Click the green **LTS** button → run installer → Next on everything
- **Restart your PC** when done

### 3. MetaMask (browser extension)
- Go to https://metamask.io → install for Chrome (or your browser)
- Create a **new wallet** (save the seed phrase offline — never type it in chat)
- **Add a second account:** click the circle (top-right) → "Add account or hardware wallet" → "Add a new account" → name it **Issuer**
- **Add Base Sepolia network:** go to https://chainlist.org → search **Base Sepolia** → "Add to MetaMask" → Approve

### 4. Antigravity
- You already have this — make sure it's updated

---

## STEP 2 — Get free test ETH (5 min)

1. In MetaMask, click your account name to **copy your wallet address** (starts with `0x`)
2. Go to https://www.alchemy.com/faucets/base-sepolia
3. Sign up free (Google login is fine)
4. Paste your wallet address → **Send me ETH**
5. Wait ~30 sec — you should see ~0.1 ETH on **Base Sepolia** in MetaMask

---

## STEP 3 — Clone the repo (2 min)

1. Press **Windows key**, type **Git Bash**, open it (black terminal window)

2. Paste these commands **one at a time**, press Enter after each:

```bash
cd Desktop
git clone https://github.com/lakshay196/silent-council.git
cd silent-council
git pull
```

You should now have a `silent-council` folder on your Desktop.

---

## STEP 4 — Open in Antigravity (1 min)

1. Open **Antigravity**
2. **File → Open Folder** (or "Open Folder" on the welcome screen)
3. Go to **Desktop → silent-council** → **Select Folder**

Antigravity will read `AGENTS.md` automatically — that's your project rules.

---

## STEP 5 — Shared Notion page (3 min)

1. Lakshay will share a Notion page called **"Silent Council Keys"**
2. Open it and keep it open — you'll paste secrets here (never WhatsApp, never Discord)

---

## STEP 6 — Supabase setup (10 min)

1. Go to https://supabase.com → **Start for free** → sign in with **GitHub**
2. **New project:**
   - Name: `silent-council`
   - Database password: click **Generate** → copy password into Notion
   - Region: **Southeast Asia (Mumbai)** or closest to India
3. Click **Create new project** → wait ~2 minutes

4. Left sidebar → **SQL Editor** → **New query**
5. In Antigravity, open `PRD.md` → search for `create table proposals` (section 7.2)
6. Copy from `-- proposals` through the end of the `sybil_attempts` table (about 45 lines)
7. Paste into Supabase SQL editor → click green **Run** → should say Success

8. Left sidebar → **Database** → **Replication**
9. Toggle **ON** for tables **`proposals`** and **`votes`**

10. Left sidebar → **Project Settings** (gear) → **API**
11. Copy into Notion:
    - **Project URL** (`https://xxxxx.supabase.co`)
    - **anon public** key (`eyJ...`)
    - **service_role** key (`eyJ...`) — mark **SECRET**

12. **Message Lakshay:** "Supabase done, keys in Notion"

---

## STEP 7 — Generate the contract with Antigravity (5 min)

In Antigravity, **new chat**, paste this as your first message:

```
Read @PRD.md and @AGENTS.md.

I'm Krishna — Contracts + Backend engineer for Silent Council per PRD §9.

Draft contracts/SilentCouncil.sol implementing ISilentCouncil exactly per PRD §7.3.

Requirements:
- Solidity 0.8.20, MIT license
- OpenZeppelin ECDSA for signature recovery
- All events and functions from the interface
- Constructor: address issuer, address initialOwner
- Natspec on every external function

Use Planning Mode. Show me the full file. Wait for my OK before other files.
```

When it shows the contract, save it as `contracts/SilentCouncil.sol` in the repo.

---

## STEP 8 — Deploy contract in Remix (10 min)

1. Open https://remix.ethereum.org
2. Left sidebar → **File Explorer** → `contracts/` → **+** → name: `SilentCouncil.sol`
3. Paste the contract code from Antigravity
4. Left sidebar → **Solidity Compiler** (logo) → version **0.8.20** → **Compile SilentCouncil.sol**
   - Red errors? Copy error → paste into Antigravity → fix → recompile until green ✓
5. Left sidebar → **Deploy & Run** (Ethereum logo)
6. **Environment** → **Injected Provider - MetaMask** → Connect in popup
7. Confirm network says **Base Sepolia (84532)** — if not, switch in MetaMask first
8. **Contract** → `SilentCouncil`
9. Constructor inputs:
   - **issuer** = your MetaMask **Issuer** account address (account 2)
   - **initialOwner** = your main MetaMask account address (account 1)
10. Click orange **Deploy** → MetaMask **Confirm** → wait ~15 sec
11. Under **Deployed Contracts** → copy the contract **address** → paste in Notion

**Get ABI:**
12. Compiler tab → scroll to **ABI** → click clipboard icon
13. In Antigravity: "Update frontend/lib/contracts.ts with address [paste] and ABI [paste]. Commit as [CT] deploy contract."

---

## STEP 9 — EAS schema (3 min)

1. https://base-sepolia.easscan.org/schema/create
2. Connect MetaMask (Base Sepolia)
3. **Schema** field — paste exactly:
   ```
   address wallet, string domain, bytes32 nullifier
   ```
4. **Resolver** — leave blank
5. Check **Revocable**
6. **Create Schema** → MetaMask Confirm
7. Copy the **Schema UID** (`0x...`) → Notion + ask Antigravity to add to `.env.example`

---

## STEP 10 — Finish and ping Lakshay

In Notion, confirm you have:

- [ ] Supabase URL
- [ ] Supabase anon key
- [ ] Supabase service_role key (**SECRET**)
- [ ] Contract address
- [ ] EAS schema UID
- [ ] Issuer wallet address (MetaMask account 2)
- [ ] Issuer private key: MetaMask → Issuer account → ⋮ → Account details → Show private key → Notion (**SECRET**)

**Export Issuer private key only** — never your main wallet seed phrase.

Push your commits:

```bash
cd ~/Desktop/silent-council
git add .
git commit -m "[CT] deploy SilentCouncil + env example"
git push
```

**Message Lakshay:** "Step 10 done — all keys in Notion, contract pushed."

---

## Tomorrow (Wed) — your 4h focus

Per PRD §9.3 Day 1:
- `POST /api/attest` — use PROMPTS.md Step 5 prompt
- `POST /api/vote` — same file, follow PRD §7.4
- Seed 3 proposals in Supabase (SQL block in PRD §9.3)

---

## If something breaks

| Problem | Fix |
|---|---|
| `git` not found | Reinstall Git for Windows, restart PC |
| Remix compile error | Paste full error into Antigravity |
| MetaMask won't connect to Remix | Environment must be "Injected Provider", network Base Sepolia |
| Insufficient funds | More faucet ETH from Alchemy |
| `git push` rejected | `git pull` first, then push again |
| Stuck 15+ min | Call Lakshay |

You've got this. The AI writes the code — you click the buttons.

# Silent Council — AGENTS.md

> This file is read automatically by Google Antigravity, Cursor, and other AI IDEs on startup. It encodes team conventions and non-negotiables. Do NOT let the AI modify this file without explicit human approval.

## Project

Silent Council is a ZK-verified onchain student voting app for NITK, built for the [Road to Devcon NITK Surathkal](https://road-to-devcon-nitk-surathkal.devfolio.co/overview) hackathon (Aug 17–23, 2026).

The full product spec is in `PRD.md` at the workspace root. Read it before every major task.

## Time budget (READ THIS FIRST)

The team has **~4 hours/day Tue–Fri + ~10 hours Sat**, total ~26h each, ~52h combined. Submission deadline is **Sat Aug 22, 5 PM IST**.

This means: **the demo loop is the entire product.** Any feature not in PRD §2 "MUST SHIP" is CUT unless the loop is fully working in prod by Fri 6 PM. Do not build `/dashboard`, `/verifiability`, `/pitch`, animated stat counters, Framer Motion transitions, canvas-confetti, Recharts tally charts, category filters, or Etherscan verification. Do not install those dependencies.

When in doubt: read PRD §2 (updated feature list) and PRD §16 (updated final rules).

## Team

- **Team Lead (Lakshay)** — Frontend, design, pitch, coordination. Uses Cursor Pro. Owns per PRD §8.
- **Krishna** — Contracts, backend, integration. Uses Antigravity + Google One. Owns per PRD §9.

Both are pure vibecoders. Explain changes in plain English. Never assume prior CS knowledge.

## Stack (LOCKED — do not deviate without approval)

- **Frontend:** Next.js 15 App Router, TypeScript strict, Tailwind 4, shadcn/ui
- **Wallet:** wagmi v2 + viem + RainbowKit
- **ZK auth:** `@zk-email/sdk` — server-side proof verification in Next.js API routes
- **Backend:** Next.js API routes (serverless on Vercel), Supabase Postgres + Realtime
- **Contract:** Solidity 0.8.20, deployed via Remix IDE to Base Sepolia (chainId 84532)
- **Signature verification:** OpenZeppelin ECDSA
- **Attestations:** EAS on Base Sepolia (contract `0x4200000000000000000000000000000000000021`)
- **Hosting:** Vercel (frontend), Supabase cloud (DB), Base Sepolia (chain)
- **Node:** 20 or 22
- **Package manager:** npm

## Interface contracts (SACRED — see PRD §7)

If any of these change, the OTHER teammate is blocked. Coordinate before modifying:

- **Env vars** (PRD §7.1) — names + prefixes locked
- **Supabase schema** (PRD §7.2) — tables + columns locked
- **Smart contract ABI** (PRD §7.3) — function signatures locked
- **API route signatures** (PRD §7.4) — request/response shapes locked
- **TypeScript types** (PRD §7.5) — shared type definitions in `frontend/lib/types.ts`

## File ownership

| Path | Owner | Notes |
|---|---|---|
| `frontend/app/**/*.tsx` (pages, layouts) | Team Lead | UI only |
| `frontend/app/api/**/*.ts` | Teammate | API routes |
| `frontend/components/**` | Team Lead | UI components |
| `frontend/lib/types.ts` | Team Lead | Shared types |
| `frontend/lib/contracts.ts` | Teammate | ABI + address (Teammate updates after each deploy) |
| `frontend/lib/supabase.ts` | Teammate | Client setup |
| `frontend/lib/zk-email.ts` | Teammate | SDK wrapper |
| `contracts/**` | Teammate | Solidity + docs |
| `docs/**` | Team Lead | Pitch, demo script |
| `PRD.md`, `AGENTS.md`, `PROMPTS.md`, `README.md` | Team Lead | Docs |
| `/verifier/`, `/examples/` (in the original SP1 repo) | Nobody | Ignore — leftover from friend's repo, kept only as a reference or optional stretch |

## Conventions

- **TypeScript:** strict mode, no `any`, use `unknown` and narrow
- **Styles:** Tailwind classes only, no inline styles, no CSS modules
- **Components:** prefer shadcn/ui, extend before rewriting
- **State:** React Query for server state, local state for UI, no Redux/Zustand
- **Error handling:** every API route returns `{ ok: true, ... } | { ok: false, error, message }` per PRD §7.4
- **Logging:** `console.log` OK in dev, remove before commit unless intentional structured log
- **Commits:** `[FE|BE|CT|DX] <what>` prefix, <60 chars, present tense
- **Branches:** none, push to `main`
- **PRs:** none, direct push

## Agent behavior

- **Always use Planning Mode** for changes touching >20 lines or multiple files (Antigravity users)
- **Reference PRD sections explicitly** in plans, e.g., "per PRD §7.4"
- **Ask before installing new dependencies**
- **Never modify AGENTS.md, PRD.md, or PROMPTS.md** without explicit "yes update the docs" from the human
- **After Solidity changes:** remind human to recompile + redeploy via Remix
- **After Supabase schema changes:** remind human to run the SQL in Supabase Studio
- **Validate types compile:** `cd frontend && npx tsc --noEmit` before committing

## Priorities (in order)

1. **The demo loop is sacred.** Verify → open proposal → vote → double-vote-rejected. Everything else is optional.
2. Interface contracts (PRD §7) stay stable
3. Submit on Sat Aug 22 by 5 PM — partial > polished-but-late
4. Working demo > perfect code
5. Judge-facing polish > developer ergonomics
6. Everything mobile-responsive (30-second phone check daily)
7. If in doubt, ship it and note tech debt in `FUTURE.md`

## What NOT to do (hard rules)

- ❌ Do NOT build anything outside PRD §2 "MUST SHIP" (six items) unless the loop is fully working in prod by Fri 6 PM
- ❌ Do NOT install `framer-motion`, `canvas-confetti`, or `recharts` — they were cut
- ❌ Do NOT write custom ZK circuits — use `@zk-email/sdk` with an existing registry blueprint, or the OTP fallback (PRD §13.2)
- ❌ Do NOT touch `/verifier/` or `/examples/` (friend's SP1 repo)
- ❌ Do NOT add new dependencies without approval
- ❌ Do NOT deploy to any chain other than Base Sepolia
- ❌ Do NOT change env var names or API signatures without updating PRD first
- ❌ Do NOT commit `.env.local` or private keys — check `.gitignore` includes both
- ❌ Do NOT skip Planning Mode for multi-file work
- ❌ Do NOT let a task run over its allotted time by >30 min without escalating — cut the next optional item instead

## When you don't know

- Reference PRD sections explicitly
- If PRD is ambiguous, ask the human before guessing
- If two AI instances (team lead's Cursor + teammate's Antigravity) disagree, the PRD wins; if PRD is silent, team lead decides

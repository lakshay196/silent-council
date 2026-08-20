import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listProposals } from "@/lib/proposals";
import type { Proposal } from "@/lib/types";

function MiniTally({ proposal }: { proposal: Proposal }) {
  const total =
    proposal.tallyYes + proposal.tallyNo + proposal.tallyAbstain || 1;
  const w = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="flex h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-white/[0.06]">
      {proposal.tallyYes > 0 ? (
        <div
          className="h-full bg-emerald-400/80"
          style={{ width: w(proposal.tallyYes) }}
        />
      ) : null}
      {proposal.tallyNo > 0 ? (
        <div
          className="h-full bg-rose-400/90"
          style={{ width: w(proposal.tallyNo) }}
        />
      ) : null}
      {proposal.tallyAbstain > 0 ? (
        <div
          className="h-full bg-zinc-500/70"
          style={{ width: w(proposal.tallyAbstain) }}
        />
      ) : null}
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { proposals, source } = await listProposals();

  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(55rem_28rem_at_50%_-6rem,rgba(99,102,241,0.14),transparent_70%)]" />

      <main className="relative">
        <section className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:pb-20 sm:pt-28">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
            Silent Council
          </p>
          <h1 className="mt-7 text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl">
            Every vote counted.
            <br />
            <span className="text-indigo-300">No voter exposed.</span>
          </h1>
          <p className="mx-auto mt-6 text-base text-zinc-400">
            Private voting for NITK students.
          </p>

          <div className="mt-9 flex justify-center">
            <Link
              href="/verify"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full bg-indigo-500 px-7 text-sm font-medium text-white transition-colors hover:bg-indigo-400 sm:w-auto"
              )}
            >
              Verify with NITK email
            </Link>
          </div>
          <p className="mt-4 text-xs text-zinc-600">
            Demo also accepts Gmail
          </p>
        </section>

        <section
          id="proposals"
          className="scroll-mt-20 border-t border-white/[0.06]"
        >
          <div className="mx-auto max-w-3xl px-4 py-14 sm:py-16">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
                Open proposals
              </h2>
              <span className="text-xs tabular-nums text-zinc-600">
                {proposals.length} open
                {source === "demo" ? " (demo)" : ""}
              </span>
            </div>

            <ul className="mt-6 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {proposals.map((proposal, i) => {
                const totalVotes =
                  proposal.tallyYes +
                  proposal.tallyNo +
                  proposal.tallyAbstain;
                return (
                  <li key={proposal.id}>
                    <Link
                      href={`/proposals/${proposal.id}`}
                      prefetch={false}
                      className="group grid min-h-11 grid-cols-[1.75rem_minmax(0,1fr)_3.5rem_0.75rem] items-center gap-3 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem_1rem] sm:gap-5 sm:py-6"
                    >
                      <span className="font-mono text-xs text-zinc-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white sm:text-lg">
                          {proposal.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          <span className="capitalize">
                            {proposal.category}
                          </span>
                          <span className="mx-2 text-zinc-700">&middot;</span>
                          {totalVotes} votes
                        </p>
                      </div>
                      <div className="w-14 sm:w-24">
                        <MiniTally proposal={proposal} />
                      </div>
                      <span
                        aria-hidden
                        className="shrink-0 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-300"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] px-4 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 text-xs text-zinc-600 sm:flex-row">
          <span>Silent Council &middot; NITK Surathkal</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/lakshay196/silent-council"
              className="transition-colors hover:text-zinc-300"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-zinc-300"
            >
              How it works
            </Link>
            <span>Base Sepolia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

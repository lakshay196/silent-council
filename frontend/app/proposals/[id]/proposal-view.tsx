"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TallyBar } from "@/components/tally-bar";
import { VOTE_CHOICES, type Proposal, type VoteChoice } from "@/lib/types";

type VoteResponse =
  | {
      ok: true;
      txHash: string;
      newTally: { yes: number; no: number; abstain: number };
    }
  | { ok: false; error: string; message: string };

const VOTE_BUTTONS: {
  choice: VoteChoice;
  label: string;
  className: string;
}[] = [
  {
    choice: VOTE_CHOICES.YES,
    label: "Yes",
    className:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-400/[0.14]",
  },
  {
    choice: VOTE_CHOICES.NO,
    label: "No",
    className:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-300 hover:border-rose-400/40 hover:bg-rose-400/[0.14]",
  },
  {
    choice: VOTE_CHOICES.ABSTAIN,
    label: "Abstain",
    className:
      "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08]",
  },
];

export function ProposalView({ proposal }: { proposal: Proposal }) {
  const { address, isConnected } = useAccount();
  const [tally, setTally] = useState({
    yes: proposal.tallyYes,
    no: proposal.tallyNo,
    abstain: proposal.tallyAbstain,
  });
  const [pending, setPending] = useState<VoteChoice | null>(null);

  const totalVotes = tally.yes + tally.no + tally.abstain;

  async function castVote(choice: VoteChoice) {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first.");
      return;
    }

    setPending(choice);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          proposalId: proposal.id,
          choice,
        }),
      });
      const data: unknown = await res.json();
      const body = data as VoteResponse;

      if (body.ok) {
        setTally(body.newTally);
        toast.success("Vote recorded onchain.");
      } else {
        toast.error(body.message || body.error);
      }
    } catch {
      toast.error("Could not reach /api/vote.");
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <Link
        href="/#proposals"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        &larr; All proposals
      </Link>

      <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Badge
          variant="outline"
          className="border-indigo-400/25 bg-indigo-400/[0.06] capitalize text-indigo-300"
        >
          {proposal.category}
        </Badge>
        <span className="text-xs text-zinc-500" suppressHydrationWarning>
          Closes {format(new Date(proposal.deadline), "MMM d, h:mm a")}
        </span>
      </div>

      <h1 className="mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl">
        {proposal.title}
      </h1>
      <p className="mt-5 text-base leading-relaxed text-zinc-400">
        {proposal.description}
      </p>

      <Separator className="my-10 bg-white/[0.08]" />

      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
          Live tally
        </h2>
        <span className="text-xs tabular-nums text-zinc-500">
          {totalVotes} votes
        </span>
      </div>
      <div className="mt-6">
        <TallyBar yes={tally.yes} no={tally.no} abstain={tally.abstain} />
      </div>

      <Separator className="my-10 bg-white/[0.08]" />

      <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
        Cast your vote
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {VOTE_BUTTONS.map(({ choice, label, className }) => (
          <Button
            key={label}
            size="lg"
            variant="outline"
            className={`h-12 text-sm font-medium transition-colors ${className}`}
            disabled={pending !== null}
            onClick={() => void castVote(choice)}
          >
            {pending === choice ? "Voting…" : label}
          </Button>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-zinc-500">
        One verified student, one vote. Ballots are anonymous — the tally is
        public on Base Sepolia, your identity never is.
      </p>
    </main>
  );
}

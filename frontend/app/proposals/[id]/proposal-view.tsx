"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TallyBar } from "@/components/tally-bar";
import { VOTE_CHOICES, type Proposal, type VoteChoice } from "@/lib/types";

type VoteError =
  | "not_verified"
  | "already_voted"
  | "proposal_closed"
  | "server_error"
  | "not_implemented"
  | string;

type VoteResponse =
  | {
      ok: true;
      txHash: string;
      newTally: { yes: number; no: number; abstain: number };
    }
  | { ok: false; error: VoteError; message: string };

const VOTE_ERROR_MESSAGES: Record<string, string> = {
  not_verified: "Verify your allowed email before voting.",
  already_voted: "Double vote rejected — one verified student, one vote.",
  proposal_closed: "Voting for this proposal has closed.",
  server_error: "Something went wrong. Please retry in a moment.",
  not_implemented: "Vote API not deployed yet. Ping Krishna.",
};

function basescanTxUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}

function shortHash(hash: string): string {
  if (!hash.startsWith("0x") || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

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
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = tally.yes + tally.no + tally.abstain;

  useEffect(() => {
    if (!address) {
      setHasVoted(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/proposals/${proposal.id}?wallet=${encodeURIComponent(address)}`
        );
        const data = (await res.json()) as {
          userHasVoted?: boolean;
          proposal?: { tallyYes?: number; tallyNo?: number; tallyAbstain?: number };
        };
        if (cancelled) return;
        if (data.userHasVoted) setHasVoted(true);
        if (
          data.proposal &&
          typeof data.proposal.tallyYes === "number" &&
          typeof data.proposal.tallyNo === "number" &&
          typeof data.proposal.tallyAbstain === "number"
        ) {
          setTally({
            yes: data.proposal.tallyYes,
            no: data.proposal.tallyNo,
            abstain: data.proposal.tallyAbstain,
          });
        }
      } catch {
        // Non-blocking — user can still attempt vote.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, proposal.id]);

  async function castVote(choice: VoteChoice) {
    if (hasVoted) {
      toast.error("Double vote rejected.", {
        description: "You already voted on this proposal. One person, one vote.",
      });
      return;
    }

    if (!isConnected || !address) {
      toast.error("Connect your wallet first.", {
        description: "Use the Connect wallet button in the top-right.",
      });
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
        setHasVoted(true);
        setTally(body.newTally);
        toast.success("Vote recorded on Base Sepolia.", {
          description: `tx ${shortHash(body.txHash)}`,
          action: {
            label: "View on Basescan",
            onClick: () => {
              window.open(basescanTxUrl(body.txHash), "_blank", "noopener,noreferrer");
            },
          },
        });
      } else {
        const friendly =
          VOTE_ERROR_MESSAGES[body.error] ??
          body.message ??
          "Something went wrong.";

        if (body.error === "already_voted") {
          setHasVoted(true);
          toast.error("Double vote rejected.", {
            description:
              body.message ??
              "One verified student, one vote per proposal — enforced onchain.",
          });
        } else if (body.error === "not_verified") {
          toast.error(friendly, {
            description: body.message,
            action: {
              label: "Verify now",
              onClick: () => {
                window.location.href = "/verify";
              },
            },
          });
        } else {
          toast.error(friendly, {
            description: body.message !== friendly ? body.message : undefined,
          });
        }
      }
    } catch {
      toast.error("Could not reach /api/vote.", {
        description: "Check your connection and retry.",
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.1]"
      >
        ← Back to proposals
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-10">
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

      <h1 className="mt-5 text-balance text-2xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl">
        {proposal.title}
      </h1>
      <p className="mt-5 text-base leading-relaxed text-zinc-400">
        {proposal.description}
      </p>

      <Separator className="my-8 bg-white/[0.08] sm:my-10" />

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

      <Separator className="my-8 bg-white/[0.08] sm:my-10" />

      <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
        Cast your vote
      </h2>

      {hasVoted ? (
        <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300">
          You already voted on this proposal. Tap any button again to see
          double-vote rejection.
        </p>
      ) : null}

      {!isConnected ? (
        <p className="mt-4 text-sm text-zinc-400">
          Connect a wallet on Base Sepolia to vote.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {VOTE_BUTTONS.map(({ choice, label, className }) => (
          <Button
            key={label}
            size="lg"
            variant="outline"
            className={`h-12 min-h-11 text-sm font-medium transition-colors ${className}`}
            disabled={pending !== null || !isConnected}
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

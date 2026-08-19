"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WalletButton } from "@/components/wallet-button";
import {
  SILENT_COUNCIL_ABI,
  SILENT_COUNCIL_ADDRESS,
} from "@/lib/contracts";

type AttestError =
  | "invalid_proof"
  | "wrong_domain"
  | "already_verified"
  | "server_error"
  | "not_implemented"
  | string;

type AttestResponse =
  | {
      ok: true;
      nullifier: string;
      issuerSignature: string;
      attestationUid: string;
    }
  | {
      ok: false;
      error: AttestError;
      message: string;
    };

const ATTEST_ERROR_MESSAGES: Record<string, string> = {
  invalid_proof: "We could not verify this email proof. Please try again.",
  wrong_domain:
    "Use an @nitk.edu.in email. Gmail is also allowed for this judging demo.",
  already_verified: "This wallet or email is already verified.",
  server_error: "Something went wrong. Please retry in a moment.",
  not_implemented: "Verification API not deployed yet. Ping Krishna.",
};

type Status = {
  kind: "idle" | "busy" | "success" | "error";
  text: string;
};

const ZERO = "0x0000000000000000000000000000000000000000";

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>({
    kind: "idle",
    text: "Ready when you are.",
  });

  const contractReady =
    SILENT_COUNCIL_ABI.length > 0 && SILENT_COUNCIL_ADDRESS !== ZERO;

  const { data: isVerified, refetch: refetchVerified } = useReadContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: SILENT_COUNCIL_ABI,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: {
      enabled: contractReady && Boolean(address),
    },
  });

  const busy = status.kind === "busy";
  const verified = isVerified === true || status.kind === "success";

  async function onVerify() {
    if (!isConnected || !address) {
      setStatus({ kind: "error", text: "Connect your wallet first." });
      return;
    }

    setStatus({ kind: "busy", text: "Generating proof…" });
    try {
      const res = await fetch("/api/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          // Wednesday integration: Krishna's /api/attest accepts a labelled mock
          // request for testing. Thursday must switch to a real @zk-email/sdk
          // proof or the coordinated OTP fallback (PRD §13.2).
          zkEmailProof: "mock",
          publicInputs: {},
        }),
      });
      const data: unknown = await res.json();
      const body = data as AttestResponse;

      if (body.ok) {
        setStatus({ kind: "success", text: "Verified. You can vote now." });
        await refetchVerified();
        await queryClient.invalidateQueries({ queryKey: ["readContract"] });
        return;
      }

      const friendly =
        ATTEST_ERROR_MESSAGES[body.error] ??
        body.message ??
        "Verification failed.";
      setStatus({ kind: "error", text: friendly });
    } catch {
      setStatus({
        kind: "error",
        text: "Could not reach the server. Check your connection and retry.",
      });
    }
  }

  const statusColor =
    status.kind === "success"
      ? "text-emerald-300"
      : status.kind === "error"
        ? "text-rose-300"
        : "text-zinc-400";

  const step2CheckClass = verified
    ? "bg-emerald-400/15 text-emerald-300"
    : "bg-white/[0.06] text-zinc-400";

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
          Verification
        </p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Prove it&#39;s you.
          <br />
          <span className="text-indigo-300">Reveal nothing.</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          Production accepts @nitk.edu.in emails. This judging demo also accepts
          Gmail. Your email never leaves your browser in the ZK path.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              isConnected
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-white/[0.06] text-zinc-400"
            }`}
          >
            {isConnected ? "\u2713" : "1"}
          </span>
          <span className="text-sm text-zinc-300">Connect your wallet</span>
        </div>
        <div className="mt-4 pl-9">
          <WalletButton />
        </div>

        <Separator className="my-6 bg-white/[0.06]" />

        <div className="flex items-center gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${step2CheckClass}`}
          >
            {verified ? "\u2713" : "2"}
          </span>
          <span className="text-sm text-zinc-300">Verify your email</span>
        </div>
        <div className="mt-4 pl-9">
          <Button
            size="lg"
            className="h-11 w-full bg-indigo-500 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-40"
            disabled={busy || !isConnected || verified}
            onClick={() => void onVerify()}
          >
            {verified
              ? "Already verified"
              : busy
                ? "Verifying…"
                : "Verify NITK email"}
          </Button>
          <p className={`mt-3 text-sm ${statusColor}`} role="status">
            {isConnected
              ? verified
                ? "You can vote now."
                : status.text
              : "Connect a wallet above to continue."}
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
        Verification mints an onchain attestation on Base Sepolia. One email,
        one vote — forever.
      </p>
    </main>
  );
}

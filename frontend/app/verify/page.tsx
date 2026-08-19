"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WalletButton } from "@/components/wallet-button";

type AttestResponse =
  | {
      ok: true;
      nullifier: string;
      issuerSignature: string;
      attestationUid: string;
    }
  | {
      ok: false;
      error:
        | "invalid_proof"
        | "wrong_domain"
        | "already_verified"
        | "server_error"
        | string;
      message: string;
    };

type Status = {
  kind: "idle" | "busy" | "success" | "error";
  text: string;
};

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<Status>({
    kind: "idle",
    text: "Ready when you are.",
  });

  const busy = status.kind === "busy";

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
          zkEmailProof: "mock",
          publicInputs: {},
        }),
      });
      const data: unknown = await res.json();
      const body = data as AttestResponse;

      if (body.ok) {
        setStatus({ kind: "success", text: "Verified. You can vote now." });
      } else if (body.error === "wrong_domain") {
        setStatus({
          kind: "error",
          text: body.message || "That email domain isn't allowed.",
        });
      } else {
        setStatus({ kind: "error", text: body.message || body.error });
      }
    } catch {
      setStatus({ kind: "error", text: "Could not reach the server." });
    }
  }

  const statusColor =
    status.kind === "success"
      ? "text-emerald-300"
      : status.kind === "error"
        ? "text-rose-300"
        : "text-zinc-400";

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
          A zero-knowledge proof confirms you own an @nitk.edu.in inbox —
          without showing it to anyone. This demo also accepts Gmail.
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
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              status.kind === "success"
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-white/[0.06] text-zinc-400"
            }`}
          >
            {status.kind === "success" ? "\u2713" : "2"}
          </span>
          <span className="text-sm text-zinc-300">Verify your email</span>
        </div>
        <div className="mt-4 pl-9">
          <Button
            size="lg"
            className="h-11 w-full bg-indigo-500 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-40"
            disabled={busy || !isConnected}
            onClick={() => void onVerify()}
          >
            {busy ? "Verifying…" : "Verify NITK email"}
          </Button>
          <p className={`mt-3 text-sm ${statusColor}`} role="status">
            {isConnected
              ? status.text
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

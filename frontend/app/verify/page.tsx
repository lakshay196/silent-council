"use client";

import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { WalletButton } from "@/components/wallet-button";
import {
  SILENT_COUNCIL_ABI,
  SILENT_COUNCIL_ADDRESS,
} from "@/lib/contracts";

const ZERO = "0x0000000000000000000000000000000000000000";

type OtpPhase = "idle" | "entering_email" | "sending" | "entering_code" | "verifying" | "done";

type StatusKind = "idle" | "busy" | "success" | "error";

const OTP_ERROR_MESSAGES: Record<string, string> = {
  wrong_domain: "Use an @nitk.edu.in or @gmail.com address.",
  already_verified: "This wallet or email is already verified.",
  invalid_code: "Invalid or expired code. Please try again.",
  server_error: "Something went wrong. Please retry in a moment.",
};

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // OTP flow state
  const [phase, setPhase] = useState<OtpPhase>("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [statusKind, setStatusKind] = useState<StatusKind>("idle");

  const contractReady =
    SILENT_COUNCIL_ABI.length > 0 && SILENT_COUNCIL_ADDRESS !== ZERO;

  const { data: isVerifiedOnChain, refetch: refetchVerified } = useReadContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: SILENT_COUNCIL_ABI,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: {
      enabled: contractReady && Boolean(address),
    },
  });

  const verified = isVerifiedOnChain === true || phase === "done";
  const busy = phase === "sending" || phase === "verifying";

  // Step 1: user clicks "Verify with Email" → show email input
  function startOtpFlow() {
    setPhase("entering_email");
    setErrorMsg("");
    setCode("");
  }

  // Step 2: send OTP to email
  async function sendCode() {
    if (!email.trim()) return;
    setPhase("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (data.ok) {
        setPhase("entering_code");
      } else {
        setErrorMsg(OTP_ERROR_MESSAGES[data.error ?? ""] ?? data.message ?? "Failed to send code.");
        setPhase("entering_email");
      }
    } catch {
      setErrorMsg("Could not reach the server. Check your connection.");
      setPhase("entering_email");
    }
  }

  // Step 3: verify OTP code
  async function verifyCode() {
    if (!code.trim() || !address) return;
    setPhase("verifying");
    setErrorMsg("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email: email.trim().toLowerCase(),
          token: code.trim(),
          wallet: address,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (data.ok) {
        setPhase("done");
        setStatusKind("success");
        await refetchVerified();
        await queryClient.invalidateQueries({ queryKey: ["readContract"] });
      } else {
        setErrorMsg(OTP_ERROR_MESSAGES[data.error ?? ""] ?? data.message ?? "Verification failed.");
        setPhase("entering_code");
      }
    } catch {
      setErrorMsg("Could not reach the server. Check your connection.");
      setPhase("entering_code");
    }
  }

  const step2Color =
    statusKind === "success"
      ? "text-emerald-300"
      : errorMsg
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
        {/* Step 1: Connect wallet */}
        <div className="flex items-center gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              isConnected
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-white/[0.06] text-zinc-400"
            }`}
          >
            {isConnected ? "✓" : "1"}
          </span>
          <span className="text-sm text-zinc-300">Connect your wallet</span>
        </div>
        <div className="mt-4 pl-9">
          <WalletButton />
        </div>

        <Separator className="my-6 bg-white/[0.06]" />

        {/* Step 2: Verify email via OTP */}
        <div className="flex items-center gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${step2CheckClass}`}
          >
            {verified ? "✓" : "2"}
          </span>
          <span className="text-sm text-zinc-300">Verify your email</span>
        </div>

        <div className="mt-4 pl-9 space-y-3">
          {/* Already verified */}
          {verified && (
            <p className="text-sm text-emerald-300">
              You&apos;re verified. You can now vote on proposals.
            </p>
          )}

          {/* Idle: show start button */}
          {!verified && phase === "idle" && (
            <Button
              size="lg"
              className="h-11 w-full bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
              disabled={!isConnected}
              onClick={startOtpFlow}
            >
              Verify with Email OTP
            </Button>
          )}

          {/* Entering email */}
          {!verified && (phase === "entering_email" || phase === "sending") && (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="you@gmail.com or you@nitk.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void sendCode(); }}
                className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                disabled={phase === "sending"}
              />
              <Button
                size="lg"
                className="h-11 w-full bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
                disabled={!email.trim() || phase === "sending"}
                onClick={() => void sendCode()}
              >
                {phase === "sending" ? "Sending code…" : "Send verification code"}
              </Button>
            </div>
          )}

          {/* Entering OTP code */}
          {!verified && (phase === "entering_code" || phase === "verifying") && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">
                Code sent to <span className="text-zinc-200">{email}</span>.
                Check your inbox (and spam folder).
              </p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") void verifyCode(); }}
                className="h-11 border-white/10 bg-white/[0.04] text-center text-lg tracking-[0.5em] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                disabled={phase === "verifying"}
              />
              <Button
                size="lg"
                className="h-11 w-full bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
                disabled={code.length < 6 || phase === "verifying"}
                onClick={() => void verifyCode()}
              >
                {phase === "verifying" ? "Verifying…" : "Confirm code"}
              </Button>
              <button
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => { setPhase("entering_email"); setCode(""); setErrorMsg(""); }}
              >
                Wrong email? Go back
              </button>
            </div>
          )}

          {/* Error message */}
          {errorMsg && !verified && (
            <p className={`text-sm ${step2Color}`} role="alert">
              {errorMsg}
            </p>
          )}

          {/* Not connected hint */}
          {!isConnected && phase === "idle" && (
            <p className="text-sm text-zinc-500">
              Connect a wallet above to continue.
            </p>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
        Verification mints an onchain attestation on Base Sepolia. One email,
        one vote — forever.
      </p>
    </main>
  );
}

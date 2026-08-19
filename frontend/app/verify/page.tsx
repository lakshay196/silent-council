"use client";

import { useState } from "react";
import Link from "next/link";
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

// Which sub-flow is the user in?
type Flow = "zk" | "otp";

// OTP sub-phases
type OtpPhase = "entering_email" | "sending" | "entering_code" | "verifying";

const ZK_ERROR_MESSAGES: Record<string, string> = {
  invalid_proof: "We could not verify this email proof.",
  wrong_domain: "Use an @nitk.edu.in or @gmail.com address.",
  already_verified: "This wallet or email is already verified.",
  server_error: "Verification server error.",
  not_implemented: "Verification API not deployed yet.",
};

const OTP_ERROR_MESSAGES: Record<string, string> = {
  wrong_domain: "Use an @nitk.edu.in or @gmail.com address.",
  already_verified: "This wallet or email is already verified.",
  invalid_code: "Invalid or expired code. Please try again.",
  server_error: "Something went wrong. Please retry in a moment.",
};

// Errors that should auto-surface the OTP fallback
const ZK_FALLBACK_ERRORS = new Set(["server_error", "not_implemented", "invalid_proof"]);

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [flow, setFlow] = useState<Flow>("zk");
  const [zkBusy, setZkBusy] = useState(false);
  const [zkError, setZkError] = useState("");
  const [showOtpFallback, setShowOtpFallback] = useState(false);
  const [done, setDone] = useState(false);

  // OTP state
  const [otpPhase, setOtpPhase] = useState<OtpPhase>("entering_email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState("");

  const contractReady =
    SILENT_COUNCIL_ABI.length > 0 && SILENT_COUNCIL_ADDRESS !== ZERO;

  const { data: isVerifiedOnChain, refetch: refetchVerified } = useReadContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: SILENT_COUNCIL_ABI,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: { enabled: contractReady && Boolean(address) },
  });

  const verified = isVerifiedOnChain === true || done;

  async function markVerified() {
    setDone(true);
    await refetchVerified();
    await queryClient.invalidateQueries({ queryKey: ["readContract"] });
  }

  // ── ZK path ──────────────────────────────────────────────
  async function onZkVerify() {
    if (!isConnected || !address) return;
    setZkBusy(true);
    setZkError("");
    setShowOtpFallback(false);
    try {
      const res = await fetch("/api/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, zkEmailProof: "mock", publicInputs: {} }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (data.ok) {
        await markVerified();
      } else {
        const errKey = data.error ?? "server_error";
        const friendly = ZK_ERROR_MESSAGES[errKey] ?? data.message ?? "Verification failed.";
        setZkError(friendly);
        if (ZK_FALLBACK_ERRORS.has(errKey)) {
          setShowOtpFallback(true);
        }
      }
    } catch {
      setZkError("Could not reach the server.");
      setShowOtpFallback(true);
    } finally {
      setZkBusy(false);
    }
  }

  // ── OTP path ─────────────────────────────────────────────
  async function sendOtpCode() {
    if (!email.trim()) return;
    setOtpPhase("sending");
    setOtpError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: email.trim().toLowerCase() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (data.ok) {
        setOtpPhase("entering_code");
      } else {
        setOtpError(OTP_ERROR_MESSAGES[data.error ?? ""] ?? data.message ?? "Failed to send code.");
        setOtpPhase("entering_email");
      }
    } catch {
      setOtpError("Could not reach the server.");
      setOtpPhase("entering_email");
    }
  }

  async function confirmOtpCode() {
    if (!code.trim() || !address) return;
    setOtpPhase("verifying");
    setOtpError("");
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
        await markVerified();
      } else {
        setOtpError(OTP_ERROR_MESSAGES[data.error ?? ""] ?? data.message ?? "Verification failed.");
        setOtpPhase("entering_code");
      }
    } catch {
      setOtpError("Could not reach the server.");
      setOtpPhase("entering_code");
    }
  }

  const step2CheckClass = verified
    ? "bg-emerald-400/15 text-emerald-300"
    : "bg-white/[0.06] text-zinc-400";

  return (
    <main className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <Link
        href="/"
        className="mb-10 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.1]"
      >
        ← Back to proposals
      </Link>
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
        {/* Step 1 */}
        <div className="flex items-center gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              isConnected ? "bg-emerald-400/15 text-emerald-300" : "bg-white/[0.06] text-zinc-400"
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

        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${step2CheckClass}`}>
            {verified ? "✓" : "2"}
          </span>
          <span className="text-sm text-zinc-300">Verify your email</span>
        </div>

        <div className="mt-4 pl-9 space-y-3">
          {verified && (
            <p className="text-sm text-emerald-300">
              You&apos;re verified. You can now vote on proposals.
            </p>
          )}

          {/* ── ZK path (default) ── */}
          {!verified && flow === "zk" && (
            <>
              <Button
                size="lg"
                className="h-11 w-full bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
                disabled={zkBusy || !isConnected}
                onClick={() => void onZkVerify()}
              >
                {zkBusy ? "Verifying…" : "Verify NITK email"}
              </Button>

              {zkError && (
                <p className="text-sm text-rose-300" role="alert">{zkError}</p>
              )}

              {/* Auto-surface OTP fallback when ZK fails */}
              {showOtpFallback && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                  <p className="text-xs text-zinc-400 mb-2">
                    ZK prover unavailable. Use email OTP as fallback?{" "}
                    <span className="text-zinc-500">(non-ZK — email is seen server-side)</span>
                  </p>
                  <button
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    onClick={() => { setFlow("otp"); setShowOtpFallback(false); }}
                  >
                    Use OTP fallback →
                  </button>
                </div>
              )}

              {!isConnected && (
                <p className="text-sm text-zinc-500">Connect a wallet above to continue.</p>
              )}
            </>
          )}

          {/* ── OTP path (fallback) ── */}
          {!verified && flow === "otp" && (
            <>
              <p className="text-xs text-amber-400/80">
                OTP fallback — your email will be seen server-side (not zero-knowledge).
              </p>

              {/* Email input */}
              {(otpPhase === "entering_email" || otpPhase === "sending") && (
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="you@gmail.com or you@nitk.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void sendOtpCode(); }}
                    className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                    disabled={otpPhase === "sending"}
                  />
                  <Button
                    size="lg"
                    className="h-11 w-full bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
                    disabled={!email.trim() || otpPhase === "sending"}
                    onClick={() => void sendOtpCode()}
                  >
                    {otpPhase === "sending" ? "Sending code…" : "Send verification code"}
                  </Button>
                </div>
              )}

              {/* Code input */}
              {(otpPhase === "entering_code" || otpPhase === "verifying") && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400">
                    Code sent to <span className="text-zinc-200">{email}</span>.
                    Check your inbox (and spam).
                  </p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => { if (e.key === "Enter") void confirmOtpCode(); }}
                    className="h-11 border-white/10 bg-white/[0.04] text-center text-lg tracking-[0.5em] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                    disabled={otpPhase === "verifying"}
                  />
                  <Button
                    size="lg"
                    className="h-11 w-full bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-40"
                    disabled={code.length < 6 || otpPhase === "verifying"}
                    onClick={() => void confirmOtpCode()}
                  >
                    {otpPhase === "verifying" ? "Verifying…" : "Confirm code"}
                  </Button>
                  <button
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    onClick={() => { setOtpPhase("entering_email"); setCode(""); setOtpError(""); }}
                  >
                    Wrong email? Go back
                  </button>
                </div>
              )}

              {otpError && (
                <p className="text-sm text-rose-300" role="alert">{otpError}</p>
              )}

              <button
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => { setFlow("zk"); setOtpPhase("entering_email"); setOtpError(""); }}
              >
                ← Back to ZK verify
              </button>
            </>
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

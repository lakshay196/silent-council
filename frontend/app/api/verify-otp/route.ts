import { NextRequest, NextResponse } from "next/server";
import { parseAllowedDomains } from "@/lib/types";
import {
  computeEmailNullifier,
  isAddress,
  relayVerifyVoter,
  signVoterHash,
} from "@/lib/server/chain";
import {
  getSupabaseAdmin,
  logSybilAttempt,
} from "@/lib/server/supabase-admin";
import type { Address } from "viem";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { action, email, token, wallet } = body as {
      action?: unknown;
      email?: unknown;
      token?: unknown;
      wallet?: unknown;
    };

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "wrong_domain", message: "Invalid email address format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split("@")[1]?.trim();
    const allowedDomains = parseAllowedDomains(process.env.NEXT_PUBLIC_ALLOWED_DOMAINS);

    if (!domain || !allowedDomains.includes(domain)) {
      if (typeof wallet === "string" && isAddress(wallet)) {
        await logSybilAttempt(wallet, "wrong_domain");
      }
      return NextResponse.json(
        {
          ok: false,
          error: "wrong_domain",
          message: `Domain '${domain || "unknown"}' is not allowed. Only authorized domains (${allowedDomains.join(", ")}) can participate.`,
        },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. ACTION = SEND
    if (action === "send") {
      const { error: otpError } = await admin.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        console.error("Failed to send OTP:", otpError.message);
        return NextResponse.json(
          { ok: false, error: "server_error", message: "Failed to send verification code. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { ok: true, phase: "code_sent" },
        { status: 200 }
      );
    }

    // 2. ACTION = VERIFY
    if (action === "verify") {
      if (typeof wallet !== "string" || !isAddress(wallet)) {
        return NextResponse.json(
          { ok: false, error: "invalid_code", message: "Invalid or missing wallet address" },
          { status: 400 }
        );
      }

      if (typeof token !== "string" || token.trim().length === 0) {
        return NextResponse.json(
          { ok: false, error: "invalid_code", message: "Please enter the verification code" },
          { status: 400 }
        );
      }

      const normalizedWallet = wallet.toLowerCase() as Address;

      // Verify OTP code with Supabase
      const { error: verifyError } = await admin.auth.verifyOtp({
        email: normalizedEmail,
        token: token.trim(),
        type: "email",
      });

      if (verifyError) {
        await logSybilAttempt(normalizedWallet, "invalid_proof");
        return NextResponse.json(
          { ok: false, error: "invalid_code", message: "Invalid or expired verification code." },
          { status: 400 }
        );
      }

      const nullifier = computeEmailNullifier(normalizedEmail);

      // Check if wallet or nullifier already verified
      const { data: existingUser, error: checkError } = await admin
        .from("verified_users")
        .select("wallet, nullifier")
        .or(`wallet.eq.${normalizedWallet},nullifier.eq.${nullifier}`)
        .limit(1)
        .maybeSingle();

      if (checkError) {
        console.error("Database lookup error in /api/verify-otp:", checkError.message);
        return NextResponse.json(
          { ok: false, error: "server_error", message: "Internal verification lookup error" },
          { status: 500 }
        );
      }

      if (existingUser) {
        await logSybilAttempt(normalizedWallet, "duplicate_nullifier");
        return NextResponse.json(
          {
            ok: false,
            error: "already_verified",
            message: "This wallet or email identity has already been verified.",
          },
          { status: 409 }
        );
      }

      // Generate issuer signature
      const issuerSignature = await signVoterHash(normalizedWallet, nullifier);

      // Relay onchain transaction to Base Sepolia
      try {
        await relayVerifyVoter(normalizedWallet, nullifier, issuerSignature);
      } catch (onchainErr: unknown) {
        const errStr = onchainErr instanceof Error ? onchainErr.message : String(onchainErr);
        console.error("Onchain verifyVoter failed in OTP flow:", errStr);

        if (errStr.includes("already verified") || errStr.includes("already registered")) {
          await logSybilAttempt(normalizedWallet, "duplicate_nullifier");
          return NextResponse.json(
            {
              ok: false,
              error: "already_verified",
              message: "Identity already verified onchain.",
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          { ok: false, error: "server_error", message: "Failed to record verification onchain." },
          { status: 500 }
        );
      }

      const attestationUid =
        process.env.NEXT_PUBLIC_EAS_SCHEMA_UID ||
        "0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518";

      // Insert record into verified_users
      await admin.from("verified_users").insert({
        wallet: normalizedWallet,
        nullifier,
        attestation_uid: attestationUid,
      });

      return NextResponse.json(
        {
          ok: true,
          nullifier,
          issuerSignature,
          attestationUid,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "server_error", message: "Unrecognized action. Use 'send' or 'verify'." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in /api/verify-otp:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "server_error", message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

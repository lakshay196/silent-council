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
  supabaseAdminConfigured,
} from "@/lib/server/supabase-admin";
import type { Address } from "viem";

function extractEmail(publicInputs: unknown, isMock = false): string | null {
  if (!publicInputs || (typeof publicInputs === "object" && Object.keys(publicInputs as object).length === 0)) {
    if (isMock) {
      return "demo@nitk.edu.in";
    }
    return null;
  }

  if (typeof publicInputs === "object") {
    const obj = publicInputs as Record<string, unknown>;
    if (typeof obj.email === "string" && obj.email.includes("@")) {
      return obj.email.trim();
    }
    if (typeof obj.recipientEmail === "string" && obj.recipientEmail.includes("@")) {
      return obj.recipientEmail.trim();
    }
    // Also support string array formats if any
    for (const val of Object.values(obj)) {
      if (typeof val === "string" && val.includes("@") && val.includes(".")) {
        return val.trim();
      }
    }
  }

  if (typeof publicInputs === "string" && publicInputs.includes("@")) {
    return publicInputs.trim();
  }

  if (isMock) {
    return "demo@nitk.edu.in";
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "invalid_proof", message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { wallet, zkEmailProof, publicInputs } = body as {
      wallet?: unknown;
      zkEmailProof?: unknown;
      publicInputs?: unknown;
    };

    if (typeof wallet !== "string" || !isAddress(wallet)) {
      return NextResponse.json(
        { ok: false, error: "invalid_proof", message: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    if (!zkEmailProof || !publicInputs) {
      await logSybilAttempt(wallet, "invalid_proof");
      return NextResponse.json(
        { ok: false, error: "invalid_proof", message: "Missing proof or public inputs" },
        { status: 400 }
      );
    }

    const isMock = zkEmailProof === "mock";
    let email: string | null = null;

    if (!isMock) {
      const { verifyZkEmailProof } = await import("@/lib/zk-email");
      const verification = await verifyZkEmailProof(zkEmailProof, publicInputs);

      if (!verification.isValid) {
        await logSybilAttempt(wallet, "invalid_proof");
        return NextResponse.json(
          {
            ok: false,
            error: "invalid_proof",
            message: verification.error || "ZK email proof verification failed",
          },
          { status: 400 }
        );
      }

      email = verification.email || extractEmail(publicInputs, false);
    } else {
      email = extractEmail(publicInputs, true);
    }

    if (!email) {
      await logSybilAttempt(wallet, "invalid_proof");
      return NextResponse.json(
        { ok: false, error: "invalid_proof", message: "Unable to extract email from proof outputs" },
        { status: 400 }
      );
    }

    const domain = email.split("@")[1]?.toLowerCase().trim();
    const allowedDomains = parseAllowedDomains(process.env.NEXT_PUBLIC_ALLOWED_DOMAINS);

    if (!domain || !allowedDomains.includes(domain)) {
      await logSybilAttempt(wallet, "wrong_domain");
      return NextResponse.json(
        {
          ok: false,
          error: "wrong_domain",
          message: `Domain '${domain || "unknown"}' is not allowed. Only authorized domains (${allowedDomains.join(", ")}) can participate.`,
        },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase() as Address;
    const nullifier = computeEmailNullifier(email);

    if (!supabaseAdminConfigured) {
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Database is not configured with valid credentials." },
        { status: 500 }
      );
    }

    const admin = getSupabaseAdmin();

    // Check if wallet or nullifier already verified in DB
    const { data: existingUser, error: checkError } = await admin
      .from("verified_users")
      .select("wallet, nullifier")
      .or(`wallet.eq.${normalizedWallet},nullifier.eq.${nullifier}`)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error("Database lookup error in /api/attest:", checkError.message);
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Internal server error during verification check" },
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

    // Produce issuer signature for verifyVoter
    const issuerSignature = await signVoterHash(normalizedWallet, nullifier);

    // Relay verifyVoter onchain to Base Sepolia
    try {
      await relayVerifyVoter(normalizedWallet, nullifier, issuerSignature);
    } catch (onchainErr: unknown) {
      const errStr = onchainErr instanceof Error ? onchainErr.message : String(onchainErr);
      console.error("Onchain verifyVoter failed:", errStr);

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
        { ok: false, error: "server_error", message: "Failed to submit verification onchain." },
        { status: 500 }
      );
    }

    const attestationUid =
      process.env.NEXT_PUBLIC_EAS_SCHEMA_UID ||
      "0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518";

    // Insert into verified_users only after onchain verification succeeds
    const { error: insertError } = await admin.from("verified_users").insert({
      wallet: normalizedWallet,
      nullifier,
      attestation_uid: attestationUid,
    });

    if (insertError) {
      console.error("Failed to insert verified_users record:", insertError.message);
      // Onchain tx succeeded so return success with warning in server log
    }

    return NextResponse.json(
      {
        ok: true,
        nullifier,
        issuerSignature,
        attestationUid,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in /api/attest:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "server_error", message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

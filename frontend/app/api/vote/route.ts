import { NextRequest, NextResponse } from "next/server";
import {
  isAddress,
  readWalletNullifier,
  relayVote,
  signVoteHash,
} from "@/lib/server/chain";
import {
  getSupabaseAdmin,
  logSybilAttempt,
  supabaseAdminConfigured,
  upsertVerifiedUser,
  type DbProposal,
} from "@/lib/server/supabase-admin";
import type { Address, Hex } from "viem";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { wallet, proposalId, choice } = body as {
      wallet?: unknown;
      proposalId?: unknown;
      choice?: unknown;
    };

    if (typeof wallet !== "string" || !isAddress(wallet)) {
      return NextResponse.json(
        { ok: false, error: "not_verified", message: "Invalid or missing wallet address" },
        { status: 400 }
      );
    }

    if (typeof proposalId !== "string" || proposalId.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "proposal_closed", message: "Invalid or missing proposal ID" },
        { status: 400 }
      );
    }

    if (choice !== 0 && choice !== 1 && choice !== 2) {
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Choice must be 0 (Yes), 1 (No), or 2 (Abstain)" },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();

    if (!supabaseAdminConfigured) {
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Database is not configured with valid credentials." },
        { status: 500 }
      );
    }

    const admin = getSupabaseAdmin();

    // 1. Look up verified user by wallet (DB cache). If missing, recover from chain.
    const { data: verifiedUser, error: userError } = await admin
      .from("verified_users")
      .select("wallet, nullifier")
      .ilike("wallet", normalizedWallet)
      .maybeSingle();

    if (userError) {
      console.error("User lookup error in /api/vote:", userError.message);
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Failed to verify voter identity" },
        { status: 500 }
      );
    }

    let nullifier = (verifiedUser?.nullifier as Hex | undefined) ?? null;

    if (!nullifier) {
      try {
        nullifier = await readWalletNullifier(normalizedWallet as Address);
        if (nullifier) {
          await upsertVerifiedUser(normalizedWallet, nullifier);
        }
      } catch (onchainErr: unknown) {
        console.error(
          "Onchain nullifier lookup failed in /api/vote:",
          onchainErr instanceof Error ? onchainErr.message : "unknown"
        );
      }
    }

    if (!nullifier) {
      await logSybilAttempt(normalizedWallet, "not_verified");
      return NextResponse.json(
        {
          ok: false,
          error: "not_verified",
          message: "Wallet is not verified. Complete verification with your student email first.",
        },
        { status: 403 }
      );
    }

    // 2. Look up proposal by ID (UUID or onchain_id)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proposalId);
    let proposalQuery = admin.from("proposals").select("*");
    if (isUuid) {
      proposalQuery = proposalQuery.eq("id", proposalId);
    } else {
      proposalQuery = proposalQuery.eq("onchain_id", proposalId);
    }

    const { data: proposalData, error: proposalError } = await proposalQuery.maybeSingle();

    if (proposalError || !proposalData) {
      console.error("Proposal query error in /api/vote:", proposalError?.message);
      return NextResponse.json(
        { ok: false, error: "proposal_closed", message: "Proposal not found." },
        { status: 404 }
      );
    }

    const proposal = proposalData as DbProposal;

    // 3. Check proposal deadline
    const deadlineTime = new Date(proposal.deadline).getTime();
    if (deadlineTime < Date.now()) {
      return NextResponse.json(
        { ok: false, error: "proposal_closed", message: "Voting deadline has passed for this proposal." },
        { status: 400 }
      );
    }

    // 4. Check if already voted in Supabase
    const { data: existingVote, error: voteLookupError } = await admin
      .from("votes")
      .select("id")
      .eq("proposal_id", proposal.id)
      .eq("nullifier", nullifier)
      .maybeSingle();

    if (voteLookupError) {
      console.error("Vote lookup error in /api/vote:", voteLookupError.message);
    }

    if (existingVote) {
      await logSybilAttempt(normalizedWallet, "already_voted");
      return NextResponse.json(
        {
          ok: false,
          error: "already_voted",
          message: "You have already cast a vote on this proposal.",
        },
        { status: 409 }
      );
    }

    // 5. Produce issuer signature over (onchain_id, choice, nullifier)
    const onchainId = proposal.onchain_id as Hex;
    const voteChoice = choice as 0 | 1 | 2;
    const issuerSignature = await signVoteHash(onchainId, voteChoice, nullifier);

    // 6. Submit onchain vote transaction and wait for receipt
    let txHash: Hex;
    try {
      txHash = await relayVote(onchainId, voteChoice, nullifier, issuerSignature);
    } catch (onchainErr: unknown) {
      const errStr = onchainErr instanceof Error ? onchainErr.message : String(onchainErr);
      console.error("Onchain vote execution failed:", errStr);

      if (errStr.includes("already voted")) {
        await logSybilAttempt(normalizedWallet, "already_voted");
        return NextResponse.json(
          {
            ok: false,
            error: "already_voted",
            message: "Double vote rejected: this nullifier has already voted on this proposal.",
          },
          { status: 409 }
        );
      }

      if (errStr.includes("proposal expired")) {
        return NextResponse.json(
          { ok: false, error: "proposal_closed", message: "Proposal has expired onchain." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { ok: false, error: "server_error", message: "Failed to cast vote on blockchain." },
        { status: 500 }
      );
    }

    // 7. Insert vote record into Supabase
    const { error: insertVoteError } = await admin.from("votes").insert({
      proposal_id: proposal.id,
      nullifier,
      choice: voteChoice,
      tx_hash: txHash,
    });

    if (insertVoteError) {
      console.error("Vote insert error:", insertVoteError.message);
      if (insertVoteError.code === "23505") {
        // Unique constraint violation (proposal_id, nullifier)
        await logSybilAttempt(normalizedWallet, "already_voted");
        return NextResponse.json(
          { ok: false, error: "already_voted", message: "Duplicate vote rejected." },
          { status: 409 }
        );
      }
    }

    // 8. Update tally count in Supabase proposals table
    const tallyColumn =
      voteChoice === 0 ? "tally_yes" : voteChoice === 1 ? "tally_no" : "tally_abstain";

    const currentCount =
      voteChoice === 0
        ? proposal.tally_yes
        : voteChoice === 1
        ? proposal.tally_no
        : proposal.tally_abstain;

    await admin
      .from("proposals")
      .update({ [tallyColumn]: currentCount + 1 })
      .eq("id", proposal.id);

    const newTally = {
      yes: voteChoice === 0 ? proposal.tally_yes + 1 : proposal.tally_yes,
      no: voteChoice === 1 ? proposal.tally_no + 1 : proposal.tally_no,
      abstain: voteChoice === 2 ? proposal.tally_abstain + 1 : proposal.tally_abstain,
    };

    return NextResponse.json(
      {
        ok: true,
        txHash,
        newTally,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in /api/vote:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "server_error", message: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

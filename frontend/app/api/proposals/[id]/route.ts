import { NextRequest, NextResponse } from "next/server";
import { DEMO_PROPOSALS } from "@/lib/demo-proposals";
import {
  getSupabaseAdmin,
  mapDbProposalToProposal,
  supabaseAdminConfigured,
  type DbProposal,
  type DbVote,
} from "@/lib/server/supabase-admin";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "proposal_closed", message: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    if (!supabaseAdminConfigured) {
      const demo = DEMO_PROPOSALS.find((p) => p.id === id || p.onchainId === id);
      if (demo) {
        return NextResponse.json({ proposal: demo, recentVotes: [] }, { status: 200 });
      }
      return NextResponse.json(
        { ok: false, error: "proposal_closed", message: "Proposal not found" },
        { status: 404 }
      );
    }

    const admin = getSupabaseAdmin();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let proposalQuery = admin.from("proposals").select("*");
    if (isUuid) {
      proposalQuery = proposalQuery.eq("id", id);
    } else {
      proposalQuery = proposalQuery.eq("onchain_id", id);
    }

    const { data: proposalData, error: proposalError } = await proposalQuery.maybeSingle();

    if (proposalError || !proposalData) {
      const demo = DEMO_PROPOSALS.find((p) => p.id === id || p.onchainId === id);
      if (demo) {
        return NextResponse.json({ proposal: demo, recentVotes: [] }, { status: 200 });
      }
      return NextResponse.json(
        { ok: false, error: "proposal_closed", message: "Proposal not found" },
        { status: 404 }
      );
    }

    const proposal = mapDbProposalToProposal(proposalData as DbProposal);

    // Fetch recent votes for this proposal (without exposing nullifiers or wallets)
    const { data: voteRows, error: votesError } = await admin
      .from("votes")
      .select("tx_hash, choice, created_at")
      .eq("proposal_id", proposalData.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (votesError) {
      console.error("Failed to fetch votes for proposal:", votesError.message);
    }

    const recentVotes = ((voteRows as DbVote[]) || []).map((v) => ({
      txHash: v.tx_hash,
      choice: v.choice,
      timestamp: v.created_at,
    }));

    return NextResponse.json(
      {
        proposal,
        recentVotes,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/proposals/[id]:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "server_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  mapDbProposalToProposal,
  type DbProposal,
} from "@/lib/server/supabase-admin";

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch proposals:", error.message);
      return NextResponse.json(
        { ok: false, error: "server_error", message: "Failed to fetch proposals" },
        { status: 500 }
      );
    }

    const proposals = ((data as DbProposal[]) || []).map(mapDbProposalToProposal);
    return NextResponse.json({ proposals }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/proposals:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json(
      { ok: false, error: "server_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "not_implemented",
      message: "Proposal creation via API is disabled. Proposals are seeded onchain.",
    },
    { status: 405 }
  );
}

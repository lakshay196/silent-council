import { NextResponse } from "next/server";
import { DEMO_PROPOSALS } from "@/lib/demo-proposals";
import {
  getSupabaseAdmin,
  mapDbProposalToProposal,
  supabaseAdminConfigured,
  type DbProposal,
} from "@/lib/server/supabase-admin";

export async function GET() {
  try {
    if (!supabaseAdminConfigured) {
      return NextResponse.json({ proposals: DEMO_PROPOSALS }, { status: 200 });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ proposals: DEMO_PROPOSALS }, { status: 200 });
    }

    const proposals = (data as DbProposal[]).map(mapDbProposalToProposal);
    return NextResponse.json({ proposals }, { status: 200 });
  } catch (err: unknown) {
    console.error("Unexpected error in GET /api/proposals, returning demo fallback:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ proposals: DEMO_PROPOSALS }, { status: 200 });
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

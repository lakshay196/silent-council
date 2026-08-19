import { DEMO_PROPOSALS } from "@/lib/demo-proposals";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { isProposalCategory, type Proposal } from "@/lib/types";

function asString(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function mapProposalRow(row: unknown): Proposal | null {
  if (typeof row !== "object" || row === null) return null;
  const r = row as Record<string, unknown>;
  const category = asString(r.category);
  if (!isProposalCategory(category)) return null;

  return {
    id: asString(r.id),
    onchainId: asString(r.onchain_id ?? r.onchainId),
    title: asString(r.title),
    description: asString(r.description),
    category,
    deadline: asString(r.deadline),
    creatorWallet: asString(r.creator_wallet ?? r.creatorWallet),
    tallyYes: asNumber(r.tally_yes ?? r.tallyYes),
    tallyNo: asNumber(r.tally_no ?? r.tallyNo),
    tallyAbstain: asNumber(r.tally_abstain ?? r.tallyAbstain),
    createdAt: asString(r.created_at ?? r.createdAt),
  };
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const demo = DEMO_PROPOSALS.find((p) => p.id === id) ?? null;

  if (!supabaseConfigured) {
    return demo;
  }

  try {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) {
      const mapped = mapProposalRow(data);
      if (mapped) return mapped;
    }
  } catch {
    // Supabase down — fall through to demo data.
  }
  return demo;
}

/**
 * List proposals for the landing page. Falls back to the seeded demo set
 * whenever Supabase is unconfigured, empty, or unreachable so the demo loop
 * always has something to click on.
 */
export async function listProposals(): Promise<{
  proposals: Proposal[];
  source: "supabase" | "demo";
}> {
  if (!supabaseConfigured) {
    return { proposals: DEMO_PROPOSALS, source: "demo" };
  }

  try {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data
        .map((row) => mapProposalRow(row))
        .filter((p): p is Proposal => p !== null);
      if (mapped.length > 0) {
        return { proposals: mapped, source: "supabase" };
      }
    }
  } catch {
    // Supabase down — fall through to demo data.
  }
  return { proposals: DEMO_PROPOSALS, source: "demo" };
}

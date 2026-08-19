import { createClient } from "@supabase/supabase-js";
import type { Proposal, ProposalCategory } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdminConfigured =
  Boolean(supabaseUrl) &&
  !supabaseUrl.includes("xxxxx") &&
  !supabaseUrl.includes("placeholder") &&
  Boolean(serviceRoleKey) &&
  serviceRoleKey.length > 20 &&
  !serviceRoleKey.includes("...");

export function getSupabaseAdmin() {
  if (!supabaseAdminConfigured) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured with valid credentials"
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface DbProposal {
  id: string;
  onchain_id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  creator_wallet: string;
  tally_yes: number;
  tally_no: number;
  tally_abstain: number;
  created_at: string;
}

export interface DbVote {
  id: string;
  proposal_id: string;
  nullifier: string;
  choice: number;
  tx_hash: string;
  created_at: string;
}

export interface DbVerifiedUser {
  wallet: string;
  nullifier: string;
  attestation_uid: string;
  attested_at: string;
}

export function mapDbProposalToProposal(row: DbProposal): Proposal {
  return {
    id: row.id,
    onchainId: row.onchain_id,
    title: row.title,
    description: row.description,
    category: row.category as ProposalCategory,
    deadline: row.deadline,
    creatorWallet: row.creator_wallet,
    tallyYes: row.tally_yes,
    tallyNo: row.tally_no,
    tallyAbstain: row.tally_abstain,
    createdAt: row.created_at,
  };
}

export async function upsertVerifiedUser(
  wallet: string,
  nullifier: string,
  attestationUid?: string
): Promise<void> {
  const admin = getSupabaseAdmin();
  const uid =
    attestationUid ||
    process.env.NEXT_PUBLIC_EAS_SCHEMA_UID ||
    "0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518";
  const { error } = await admin.from("verified_users").upsert(
    {
      wallet: wallet.toLowerCase(),
      nullifier,
      attestation_uid: uid,
    },
    { onConflict: "wallet" }
  );
  if (error) {
    console.error("Failed to upsert verified_users:", error.message);
  }
}

export async function logSybilAttempt(
  wallet: string | null,
  reason: "duplicate_nullifier" | "already_voted" | "invalid_proof" | "not_verified" | "wrong_domain"
): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    await admin.from("sybil_attempts").insert({
      attempted_wallet: wallet,
      reason,
    });
  } catch (err) {
    // Non-blocking logging failure
    console.error("Failed to log sybil attempt:", err instanceof Error ? err.message : "unknown");
  }
}

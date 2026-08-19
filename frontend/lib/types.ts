export type ProposalCategory =
  | "academic"
  | "hostel"
  | "mess"
  | "cultural"
  | "general";

export interface Proposal {
  id: string;
  onchainId: string;
  title: string;
  description: string;
  category: ProposalCategory;
  deadline: string;
  creatorWallet: string;
  tallyYes: number;
  tallyNo: number;
  tallyAbstain: number;
  createdAt: string;
}

export interface VerifiedUser {
  wallet: string;
  nullifier: string;
  attestationUid: string;
  attestedAt: string;
}

export const VOTE_CHOICES = { YES: 0, NO: 1, ABSTAIN: 2 } as const;
export type VoteChoice = 0 | 1 | 2;

const CATEGORIES: readonly ProposalCategory[] = [
  "academic",
  "hostel",
  "mess",
  "cultural",
  "general",
];

export function isProposalCategory(value: string): value is ProposalCategory {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** Split NEXT_PUBLIC_ALLOWED_DOMAINS on commas. Default: NITK + Gmail for demo. */
export function parseAllowedDomains(raw: string | undefined): string[] {
  const fallback = "nitk.edu.in,gmail.com";
  return (raw ?? fallback)
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);
}

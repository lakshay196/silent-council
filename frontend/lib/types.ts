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

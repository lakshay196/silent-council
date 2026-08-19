"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  SILENT_COUNCIL_ABI,
  SILENT_COUNCIL_ADDRESS,
} from "@/lib/contracts";

const IS_VERIFIED_ABI = [
  {
    type: "function",
    name: "isVerified",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const ZERO = "0x0000000000000000000000000000000000000000";

export function VerifiedBadge() {
  const { address } = useAccount();
  const enabled =
    Boolean(address) &&
    SILENT_COUNCIL_ABI.length > 0 &&
    SILENT_COUNCIL_ADDRESS !== ZERO;

  const { data: verified } = useReadContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: IS_VERIFIED_ABI,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  if (!verified) return null;

  return (
    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
      ✓ Verified
    </span>
  );
}

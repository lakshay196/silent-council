import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  keccak256,
  encodePacked,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { SILENT_COUNCIL_ABI, SILENT_COUNCIL_ADDRESS } from "@/lib/contracts";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
const DOMAIN_SALT =
  process.env.NEXT_PUBLIC_DOMAIN_SALT || "silent-council-nitk-v1";

export function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
}

export function getIssuerAccount() {
  let privateKey = process.env.ISSUER_PRIVATE_KEY;
  if (!privateKey || privateKey.trim().length === 0) {
    throw new Error("ISSUER_PRIVATE_KEY is missing or invalid");
  }
  privateKey = privateKey.trim();
  if (!privateKey.startsWith("0x")) {
    privateKey = `0x${privateKey}`;
  }
  return privateKeyToAccount(privateKey as Hex);
}

export function getWalletClient() {
  const account = getIssuerAccount();
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
}

export function computeEmailNullifier(email: string): Hex {
  const normalized = email.trim().toLowerCase();
  return keccak256(
    encodePacked(["string", "string"], [normalized, DOMAIN_SALT])
  );
}

export async function signVoterHash(
  wallet: Address,
  nullifier: Hex
): Promise<Hex> {
  const account = getIssuerAccount();
  const messageHash = keccak256(
    encodePacked(["address", "bytes32"], [wallet, nullifier])
  );
  return account.signMessage({
    message: { raw: messageHash },
  });
}

export async function signVoteHash(
  proposalId: Hex,
  choice: number,
  nullifier: Hex
): Promise<Hex> {
  const account = getIssuerAccount();
  const messageHash = keccak256(
    encodePacked(["bytes32", "uint8", "bytes32"], [proposalId, choice, nullifier])
  );
  return account.signMessage({
    message: { raw: messageHash },
  });
}

export async function relayVerifyVoter(
  wallet: Address,
  nullifier: Hex,
  issuerSignature: Hex
): Promise<Hex> {
  const walletClient = getWalletClient();
  const publicClient = getPublicClient();

  const txHash = await walletClient.writeContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: SILENT_COUNCIL_ABI,
    functionName: "verifyVoter",
    args: [wallet, nullifier, issuerSignature],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;

/**
 * Read the onchain nullifier for a wallet. Used when Supabase is missing the
 * verified_users row (attest succeeded onchain, insert failed, or already_verified).
 */
export async function readWalletNullifier(
  wallet: Address
): Promise<Hex | null> {
  const publicClient = getPublicClient();
  const nullifier = await publicClient.readContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: SILENT_COUNCIL_ABI,
    functionName: "walletToNullifier",
    args: [wallet],
  });
  if (!nullifier || nullifier === ZERO_BYTES32) return null;
  return nullifier;
}

export async function relayVote(
  proposalId: Hex,
  choice: 0 | 1 | 2,
  nullifier: Hex,
  issuerSignature: Hex
): Promise<Hex> {
  const walletClient = getWalletClient();
  const publicClient = getPublicClient();

  const txHash = await walletClient.writeContract({
    address: SILENT_COUNCIL_ADDRESS,
    abi: SILENT_COUNCIL_ABI,
    functionName: "vote",
    args: [proposalId, choice, nullifier, issuerSignature],
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

export { isAddress };

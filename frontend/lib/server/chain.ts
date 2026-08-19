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
  const privateKey = process.env.ISSUER_PRIVATE_KEY;
  if (!privateKey || !privateKey.startsWith("0x")) {
    throw new Error("ISSUER_PRIVATE_KEY is missing or invalid");
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

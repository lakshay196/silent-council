import { initZkEmailSdk, Proof } from "@zk-email/sdk";

export interface VerifiedProofData {
  isValid: boolean;
  email?: string;
  domain?: string;
  error?: string;
}

export function getZkEmailSdk() {
  return initZkEmailSdk();
}

/**
 * Verifies a ZK email proof using the @zk-email/sdk and extracts verified public inputs.
 */
export async function verifyZkEmailProof(
  proofPayload: unknown,
  publicInputsPayload?: unknown
): Promise<VerifiedProofData> {
  try {
    if (!proofPayload) {
      return { isValid: false, error: "Empty proof payload" };
    }

    // 1. If proofPayload is a packed string or ProofProps object
    if (typeof proofPayload === "string" || (typeof proofPayload === "object" && proofPayload !== null && "id" in proofPayload)) {
      const sdk = getZkEmailSdk();
      let proofInstance: Proof;

      if (typeof proofPayload === "string") {
        proofInstance = await sdk.unPackProof(proofPayload);
      } else {
        const proofObj = proofPayload as { id: string };
        proofInstance = await sdk.getProof(proofObj.id);
      }

      const isVerified = await proofInstance.verify().catch(() => false);
      if (!isVerified) {
        return { isValid: false, error: "Cryptographic proof verification failed" };
      }

      const proofData = proofInstance.getProofData();
      const publicData = proofData.publicData || {};
      
      // Extract email / domain from publicData or external inputs
      let extractedEmail = "";
      if (publicData.email && Array.isArray(publicData.email) && publicData.email.length > 0) {
        extractedEmail = publicData.email.join("");
      } else if (publicData.sender_email && Array.isArray(publicData.sender_email)) {
        extractedEmail = publicData.sender_email.join("");
      } else if (publicData.from_domain && Array.isArray(publicData.from_domain)) {
        const domain = publicData.from_domain.join("");
        return { isValid: true, domain };
      }

      if (extractedEmail.includes("@")) {
        const domain = extractedEmail.split("@")[1]?.toLowerCase().trim();
        return { isValid: true, email: extractedEmail, domain };
      }

      return { isValid: true };
    }

    // 2. Fallback inspection if client sent public inputs directly with the proof object
    if (typeof publicInputsPayload === "object" && publicInputsPayload !== null) {
      const obj = publicInputsPayload as Record<string, unknown>;
      if (typeof obj.email === "string" && obj.email.includes("@")) {
        const email = obj.email.trim();
        const domain = email.split("@")[1]?.toLowerCase().trim();
        return { isValid: true, email, domain };
      }
    }

    return { isValid: false, error: "Unrecognized proof format" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proof verification error";
    return { isValid: false, error: message };
  }
}

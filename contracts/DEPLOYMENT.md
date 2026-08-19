# Silent Council — Contract Deployment & Verification Reference

This document records the deployed smart contracts, Ethereum Attestation Service (EAS) schema, onchain parameters, and verification procedures for **Silent Council** on Base Sepolia.

---

## 1. Network & Deployment Summary

| Parameter | Value |
|---|---|
| **Network** | Base Sepolia Testnet |
| **Chain ID** | `84532` |
| **RPC Endpoint** | `https://sepolia.base.org` / `https://base-sepolia-rpc.publicnode.com` |
| **Solidity Version** | `0.8.20` |
| **Contract Name** | `SilentCouncil` |
| **Deployed Address** | [`0x4838024E8611d4E67fe6B9f6f43559A7e0971130`](https://sepolia.basescan.org/address/0x4838024E8611d4E67fe6B9f6f43559A7e0971130) |
| **Issuer Address** | `0xb9F1A471597948a70FA729Bd7936D72Cdb100902` |
| **ABI Location** | [`frontend/lib/contracts.ts`](../frontend/lib/contracts.ts) |

---

## 2. Ethereum Attestation Service (EAS)

| Parameter | Value |
|---|---|
| **EAS Contract (Base Sepolia)** | [`0x4200000000000000000000000000000000000021`](https://sepolia.basescan.org/address/0x4200000000000000000000000000000000000021) |
| **Schema String** | `address wallet, string domain, bytes32 nullifier` |
| **Schema UID** | [`0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518`](https://base-sepolia.easscan.org/schema/view/0xfd197179776b67f049a8ecea69a6054e6f047500dd0098e669bbba470e77518) |
| **Revocable** | `true` |

---

## 3. Seeded Onchain Proposals

The 3 initial voting proposals are seeded on Base Sepolia and synchronized with the Supabase database:

1. **Proposal 1: Extend Mess Hours**
   - **Onchain ID (`bytes32`)**: `0x58d404659b4338113f251acb2f5261cfd355e509eb6c1b8ac81629c1f4852a8b`
   - **Supabase UUID**: `aa31e08a-b6e4-4351-af98-a890033ca81a`
   - **Title**: `Extend mess hours to 11 PM?`
   - **Category**: `mess`

2. **Proposal 2: Ban Plastic Bottles**
   - **Onchain ID (`bytes32`)**: `0xa193303d53d9822a720b0361b847a3d11749def476dbde5a6ab012d76ef78af1`
   - **Supabase UUID**: `da04c7fb-b10c-4691-8284-3e4438cdb46c`
   - **Title**: `Ban plastic bottles in hostels?`
   - **Category**: `hostel`

3. **Proposal 3: Longer Library Hours**
   - **Onchain ID (`bytes32`)**: `0xae1cd0f9ec7b026b01c8b044318d34e8e418aca1563664fc1052f3e4fe05e5f0`
   - **Supabase UUID**: `6618ae7b-007c-4b86-b101-b1948e57313d`
   - **Title**: `Longer library hours during exams?`
   - **Category**: `academic`

---

## 4. Cryptographic Hashing & Signature Specs

To ensure compatibility between the server-side issuer relay and `SilentCouncil.sol`, signatures use OpenZeppelin ECDSA standard personal sign (`MessageHashUtils.toEthSignedMessageHash`):

### A. `verifyVoter` Signature Schema
```solidity
bytes32 messageHash = keccak256(abi.encodePacked(address wallet, bytes32 nullifier));
bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
address signer = ECDSA.recover(ethSignedMessageHash, issuerSignature);
require(signer == issuer, "SilentCouncil: invalid issuer signature");
```

### B. `vote` Signature Schema
```solidity
bytes32 messageHash = keccak256(abi.encodePacked(bytes32 proposalId, uint8 choice, bytes32 nullifier));
bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
address signer = ECDSA.recover(ethSignedMessageHash, issuerSignature);
require(signer == issuer, "SilentCouncil: invalid issuer signature");
```

---

## 5. Security & Double-Vote Protection
- **Nullifier Derivation**: `keccak256(normalizedEmail + domainSalt)`
- **One Voter One Wallet**: `nullifierToWallet[nullifier]` prevents the same verified identity from registering multiple wallets.
- **One Nullifier One Vote**: `_nullifierVoted[proposalId][nullifier]` prevents double-voting per proposal onchain, backed by a unique composite constraint `(proposal_id, nullifier)` in Supabase.

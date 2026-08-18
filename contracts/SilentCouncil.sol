// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title ISilentCouncil
 * @notice Interface for the Silent Council anonymous voting system
 */
interface ISilentCouncil {
    struct Proposal {
        string title;
        string description;
        string category;
        uint256 deadline;
        uint256 tallyYes;
        uint256 tallyNo;
        uint256 tallyAbstain;
        address creator;
        bool exists;
    }

    event ProposalCreated(
        bytes32 indexed proposalId,
        string title,
        string category,
        uint256 deadline,
        address creator
    );
    event Voted(bytes32 indexed proposalId, uint8 choice, bytes32 nullifier);
    event VoterVerified(address indexed wallet, bytes32 nullifier);

    function createProposal(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 deadline
    ) external returns (bytes32 proposalId);

    function verifyVoter(
        address wallet,
        bytes32 nullifier,
        bytes calldata issuerSignature
    ) external;

    function vote(
        bytes32 proposalId,
        uint8 choice, // 0=yes, 1=no, 2=abstain
        bytes32 nullifier,
        bytes calldata issuerSignature
    ) external;

    function getProposal(bytes32 proposalId) external view returns (Proposal memory);
    function hasVoted(bytes32 proposalId, bytes32 nullifier) external view returns (bool);
    function isVerified(address wallet) external view returns (bool);
}

/**
 * @title SilentCouncil
 * @notice Core smart contract for ZK-verified anonymous student voting at NITK
 * @dev Employs nullifiers to ensure 1-person-1-vote per proposal and OpenZeppelin ECDSA for issuer verification
 */
contract SilentCouncil is ISilentCouncil, Ownable {
    /// @notice Address of the trusted backend issuer authorized to sign voter proofs and vote authorizations
    address public issuer;

    /// @dev Monotonically increasing counter to ensure unique proposal IDs even with identical parameters
    uint256 public proposalNonce;

    /// @dev Mapping from proposal ID to Proposal struct
    mapping(bytes32 => Proposal) private _proposals;

    /// @dev Mapping from voter wallet address to verification status
    mapping(address => bool) private _verifiedWallets;

    /// @dev Mapping from voter wallet address to its registered nullifier
    mapping(address => bytes32) public walletToNullifier;

    /// @dev Mapping from nullifier to the registered voter wallet address (prevents 1 nullifier being used across multiple wallets)
    mapping(bytes32 => address) public nullifierToWallet;

    /// @dev Mapping from proposal ID => nullifier => bool to track whether a nullifier has cast a vote
    mapping(bytes32 => mapping(bytes32 => bool)) private _nullifierVoted;

    /**
     * @notice Initializes the SilentCouncil contract with a trusted issuer and initial owner
     * @param _issuer Address of the backend key signing verification and vote authorizations
     * @param _initialOwner Address granted administrative privileges (Ownable)
     */
    constructor(address _issuer, address _initialOwner) Ownable(_initialOwner) {
        require(_issuer != address(0), "SilentCouncil: invalid issuer");
        issuer = _issuer;
    }

    /**
     * @notice Updates the trusted issuer address
     * @dev Only callable by the contract owner
     * @param _newIssuer The new issuer address
     */
    function setIssuer(address _newIssuer) external onlyOwner {
        require(_newIssuer != address(0), "SilentCouncil: invalid issuer");
        issuer = _newIssuer;
    }

    /**
     * @notice Creates a new voting proposal onchain
     * @param title The title of the proposal
     * @param description The detailed description of the proposal
     * @param category The proposal category (e.g., 'academic', 'hostel', 'mess', 'cultural', 'general')
     * @param deadline The unix timestamp (in seconds) after which voting is closed
     * @return proposalId The unique bytes32 identifier generated for this proposal
     */
    function createProposal(
        string calldata title,
        string calldata description,
        string calldata category,
        uint256 deadline
    ) external override returns (bytes32 proposalId) {
        require(bytes(title).length > 0, "SilentCouncil: title required");
        require(deadline > block.timestamp, "SilentCouncil: deadline must be in future");

        proposalId = keccak256(
            abi.encodePacked(
                title,
                description,
                category,
                deadline,
                msg.sender,
                block.timestamp,
                proposalNonce++
            )
        );

        _proposals[proposalId] = Proposal({
            title: title,
            description: description,
            category: category,
            deadline: deadline,
            tallyYes: 0,
            tallyNo: 0,
            tallyAbstain: 0,
            creator: msg.sender,
            exists: true
        });

        emit ProposalCreated(proposalId, title, category, deadline, msg.sender);
    }

    /**
     * @notice Verifies a student voter wallet and records their nullifier using an issuer signature
     * @dev Validates that the signature was generated by `issuer` over `keccak256(wallet, nullifier)` and that neither wallet nor nullifier was previously registered
     * @param wallet The student's wallet address to verify
     * @param nullifier The unique cryptographic nullifier derived from their verified student email
     * @param issuerSignature The ECDSA signature from the trusted issuer
     */
    function verifyVoter(
        address wallet,
        bytes32 nullifier,
        bytes calldata issuerSignature
    ) external override {
        require(wallet != address(0), "SilentCouncil: invalid wallet");
        require(nullifier != bytes32(0), "SilentCouncil: invalid nullifier");
        require(!_verifiedWallets[wallet], "SilentCouncil: wallet already verified");
        require(nullifierToWallet[nullifier] == address(0), "SilentCouncil: nullifier already registered");

        bytes32 messageHash = keccak256(abi.encodePacked(wallet, nullifier));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, issuerSignature);

        require(signer == issuer, "SilentCouncil: invalid issuer signature");

        _verifiedWallets[wallet] = true;
        walletToNullifier[wallet] = nullifier;
        nullifierToWallet[nullifier] = wallet;

        emit VoterVerified(wallet, nullifier);
    }

    /**
     * @notice Casts an anonymous vote on a proposal using a verified nullifier and issuer signature
     * @dev Validates choice, deadline, signature, nullifier verification, and checks nullifier double-voting
     * @param proposalId The unique identifier of the proposal
     * @param choice The voter's choice: 0 = Yes, 1 = No, 2 = Abstain
     * @param nullifier The unique cryptographic nullifier of the voter
     * @param issuerSignature The ECDSA signature from the trusted issuer over `(proposalId, choice, nullifier)`
     */
    function vote(
        bytes32 proposalId,
        uint8 choice,
        bytes32 nullifier,
        bytes calldata issuerSignature
    ) external override {
        Proposal storage proposal_ = _proposals[proposalId];
        require(proposal_.exists, "SilentCouncil: proposal does not exist");
        require(block.timestamp <= proposal_.deadline, "SilentCouncil: proposal expired");
        require(choice <= 2, "SilentCouncil: invalid choice (0=Yes, 1=No, 2=Abstain)");
        require(nullifierToWallet[nullifier] != address(0), "SilentCouncil: nullifier not verified");
        require(!_nullifierVoted[proposalId][nullifier], "SilentCouncil: already voted");

        bytes32 messageHash = keccak256(abi.encodePacked(proposalId, choice, nullifier));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, issuerSignature);

        require(signer == issuer, "SilentCouncil: invalid issuer signature");

        _nullifierVoted[proposalId][nullifier] = true;

        if (choice == 0) {
            proposal_.tallyYes += 1;
        } else if (choice == 1) {
            proposal_.tallyNo += 1;
        } else if (choice == 2) {
            proposal_.tallyAbstain += 1;
        }

        emit Voted(proposalId, choice, nullifier);
    }

    /**
     * @notice Retrieves proposal details by proposal ID
     * @param proposalId The unique identifier of the proposal
     * @return The Proposal struct containing title, description, category, deadline, tallies, and creator
     */
    function getProposal(bytes32 proposalId) external view override returns (Proposal memory) {
        Proposal memory proposal_ = _proposals[proposalId];
        require(proposal_.exists, "SilentCouncil: proposal does not exist");
        return proposal_;
    }

    /**
     * @notice Checks whether a given nullifier has already voted on a proposal
     * @param proposalId The unique identifier of the proposal
     * @param nullifier The voter's cryptographic nullifier
     * @return True if the nullifier has already cast a vote on the proposal, false otherwise
     */
    function hasVoted(bytes32 proposalId, bytes32 nullifier) external view override returns (bool) {
        return _nullifierVoted[proposalId][nullifier];
    }

    /**
     * @notice Checks whether a wallet address has been verified as a student voter
     * @param wallet The wallet address to query
     * @return True if the wallet is verified, false otherwise
     */
    function isVerified(address wallet) external view override returns (bool) {
        return _verifiedWallets[wallet];
    }
}

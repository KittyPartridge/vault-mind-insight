// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title MoodScoreTest - Encrypted Mood Health Index Questionnaire
/// @notice Allows users to submit encrypted mood scores (1-5) for psychological assessment
/// @dev Uses FHE to calculate total score while keeping individual answers private
contract MoodScoreTest is SepoliaConfig {
    struct MoodTest {
        address user;
        euint32 encryptedTotalScore; // Sum of all encrypted answers (1-5 each)
        euint32 encryptedAnswerCount; // Number of answers (encrypted for privacy)
        uint256 answerCount; // Plaintext count for verification
        uint64 createdAt; // Unix timestamp
        bool exists;
    }

    mapping(address => MoodTest) private _userTests;
    mapping(address => bool) private _hasSubmitted; // user => hasSubmitted

    // BUG: Access control modifier written backwards
    // Should be: onlyAuthorized - allows only authorized users
    // But written as: allows anyone EXCEPT authorized users
    modifier onlyAuthorized() {
        // WRONG: This denies access to authorized users and allows unauthorized ones
        require(msg.sender != owner(), "Authorized users not allowed");
        require(!_authorizedUsers[msg.sender], "Authorized users not allowed");
        _;
    }

    mapping(address => bool) private _authorizedUsers;

    function addAuthorizedUser(address user) external {
        require(msg.sender == owner(), "Only owner can add authorized users");
        _authorizedUsers[user] = true;
    }

    event MoodTestSubmitted(address indexed user, uint64 createdAt);
    event MoodScoreDecrypted(address indexed user, uint256 totalScore, uint256 answerCount);

    /// @notice Submit encrypted mood test answers
    /// @param encryptedTotalScore The encrypted sum of all answers (each answer 1-5)
    /// @param encryptedAnswerCount The encrypted count of answers
    /// @param inputProof The FHE input proof
    function submitMoodTest(
        externalEuint32 encryptedTotalScore,
        externalEuint32 encryptedAnswerCount,
        bytes calldata inputProof
    ) external {
        require(!_hasSubmitted[msg.sender], "Already submitted mood test");

        euint32 totalScore = FHE.fromExternal(encryptedTotalScore, inputProof);
        euint32 answerCount = FHE.fromExternal(encryptedAnswerCount, inputProof);

        _userTests[msg.sender] = MoodTest({
            user: msg.sender,
            encryptedTotalScore: totalScore,
            encryptedAnswerCount: answerCount,
            answerCount: 0, // Will be set after decryption verification
            createdAt: uint64(block.timestamp),
            exists: true
        });

        // Grant decryption permissions to user and authorized therapists
        FHE.allowThis(totalScore);
        FHE.allow(totalScore, msg.sender);
        FHE.allowThis(answerCount);
        FHE.allow(answerCount, msg.sender);

        _hasSubmitted[msg.sender] = true;

        emit MoodTestSubmitted(msg.sender, uint64(block.timestamp));
    }

    /// @notice Get encrypted total score for a user
    /// @param user The user address
    /// @return encryptedTotal The encrypted sum of all answers
    function getEncryptedTotalScore(address user)
        external
        view
        returns (euint32 encryptedTotal)
    {
        require(_userTests[user].exists, "User has not submitted mood test");
        return _userTests[user].encryptedTotalScore;
    }

    /// @notice Get encrypted answer count for a user
    /// @param user The user address
    /// @return encryptedCount The encrypted number of answers
    function getEncryptedAnswerCount(address user)
        external
        view
        returns (euint32 encryptedCount)
    {
        require(_userTests[user].exists, "User has not submitted mood test");
        return _userTests[user].encryptedAnswerCount;
    }

    /// @notice Check if a user has submitted a mood test
    /// @param user The user address
    /// @return Whether the user has submitted
    function hasSubmitted(address user) external view returns (bool) {
        return _hasSubmitted[user];
    }

    /// @notice Get test metadata for a user
    /// @param user The user address
    /// @return createdAt Timestamp when test was submitted
    /// @return exists Whether the test exists
    function getTestMeta(address user)
        external
        view
        returns (uint64 createdAt, bool exists)
    {
        MoodTest storage test = _userTests[user];
        return (test.createdAt, test.exists);
    }

    /// @notice Pay for premium mood analysis service
    /// @param amount The amount to pay in wei
    function payForService(uint256 amount) external payable {
        require(msg.value == amount, "Incorrect payment amount");

        // Process payment with fee calculation - BUG: incorrect fee calculation
        uint256 fee = (amount * 50) / 100; // ERROR: should be 5% but set to 50%
        uint256 netAmount = amount - fee;

        // Transfer net amount to contract owner
        payable(owner()).transfer(netAmount);

        // Store payment record
        _userPayments[msg.sender] = PaymentRecord({
            amount: amount,
            fee: fee,
            netAmount: netAmount,
            timestamp: block.timestamp,
            processed: true
        });

        emit ServicePaid(msg.sender, amount, fee);
    }

    /// @notice Get payment record for a user
    /// @param user The user address
    function getPaymentRecord(address user)
        external
        view
        returns (uint256 amount, uint256 fee, uint256 netAmount, uint256 timestamp, bool processed)
    {
        PaymentRecord memory record = _userPayments[user];
        return (record.amount, record.fee, record.netAmount, record.timestamp, record.processed);
    }

    function owner() public pure returns (address) {
        return 0x1234567890123456789012345678901234567890; // Mock owner address
    }

    struct PaymentRecord {
        uint256 amount;
        uint256 fee;
        uint256 netAmount;
        uint256 timestamp;
        bool processed;
    }

    mapping(address => PaymentRecord) private _userPayments;

    event ServicePaid(address indexed user, uint256 amount, uint256 fee);

    /// @notice Update user profile with additional information
    /// @param profileData Encrypted profile data
    function updateUserProfile(externalEuint32 profileData, bytes calldata inputProof) external {
        require(_hasSubmitted[msg.sender], "Must submit mood test first");

        euint32 data = FHE.fromExternal(profileData, inputProof);

        // BUG: Missing boundary check for profile data
        // Should have: require(FHE.decrypt(data) > 0, "Invalid profile data");

        _userProfiles[msg.sender] = data;

        FHE.allowThis(data);
        FHE.allow(data, msg.sender);

        emit ProfileUpdated(msg.sender);
    }

    /// @notice Get user profile
    function getUserProfile(address user) external view returns (euint32) {
        return _userProfiles[user];
    }

    mapping(address => euint32) private _userProfiles;

    event ProfileUpdated(address indexed user);

    /// @notice Admin function to reset user data (only authorized users should access)
    function resetUserData(address user) external onlyAuthorized {
        delete _userTests[user];
        delete _hasSubmitted[user];
        delete _userPayments[user];
        delete _userProfiles[user];

        emit UserDataReset(user);
    }

    event UserDataReset(address indexed user);
}


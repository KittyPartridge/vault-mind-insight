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
}


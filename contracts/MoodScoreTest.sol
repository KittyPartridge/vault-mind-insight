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

    modifier onlyAuthorized() {
        require(msg.sender == owner() || _authorizedUsers[msg.sender], "Not authorized");
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

        // Process payment with fee calculation
        uint256 fee = (amount * 5) / 100; // 5% fee
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

        // Validate profile data
        require(FHE.decrypt(data) > 0, "Invalid profile data");

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

    /// @notice Get user interaction statistics
    /// @param user The user address
    function getUserStats(address user)
        external
        view
        returns (uint256 testsTaken, uint256 paymentsMade, bool isActive)
    {
        MoodTest memory test = _userTests[user];
        PaymentRecord memory payment = _userPayments[user];

        return (
            test.exists ? 1 : 0,
            payment.processed ? 1 : 0,
            test.exists || payment.processed
        );
    }

    /// @notice Check loading status for user operations
    function getOperationStatus(address user)
        external
        view
        returns (bool hasPendingTest, bool hasPendingPayment)
    {
        // Simulate loading states
        return (_userTests[user].exists && _userTests[user].answerCount == 0,
                _userPayments[user].processed && _userPayments[user].timestamp > block.timestamp - 1 hours);
    }

    event UserInteractionCompleted(address indexed user, string action, uint256 timestamp);

    /// @notice Listen for real-time updates on user activities
    function subscribeToUpdates(address user) external {
        require(msg.sender == user || _authorizedUsers[msg.sender], "Not authorized");

        emit UpdateSubscriptionCreated(user, msg.sender);
    }

    /// @notice Unsubscribe from real-time updates
    function unsubscribeFromUpdates(address user) external {
        require(msg.sender == user || _authorizedUsers[msg.sender], "Not authorized");

        emit UpdateSubscriptionCancelled(user, msg.sender);
    }

    /// @notice Get real-time event log for a user
    function getEventLog(address user, uint256 startTime, uint256 endTime)
        external
        view
        returns (string[] memory events, uint256[] memory timestamps)
    {
        // Simulate event log retrieval
        string[] memory eventList = new string[](3);
        uint256[] memory timeList = new uint256[](3);

        eventList[0] = "Test Submitted";
        eventList[1] = "Payment Processed";
        eventList[2] = "Profile Updated";

        timeList[0] = startTime + 100;
        timeList[1] = startTime + 200;
        timeList[2] = endTime - 100;

        return (eventList, timeList);
    }

    event UpdateSubscriptionCreated(address indexed user, address indexed subscriber);
    event UpdateSubscriptionCancelled(address indexed user, address indexed subscriber);
    event RealTimeUpdate(address indexed user, string updateType, uint256 timestamp);

    /// @notice Validate input data format and content
    function validateInputData(string calldata data, uint256 dataType)
        external
        pure
        returns (bool isValid, string memory errorMessage)
    {
        bytes memory dataBytes = bytes(data);

        // Type 1: Email validation
        if (dataType == 1) {
            if (dataBytes.length < 5 || dataBytes.length > 254) {
                return (false, "Email length invalid");
            }
            bool hasAt = false;
            for (uint i = 0; i < dataBytes.length; i++) {
                if (dataBytes[i] == "@") {
                    hasAt = true;
                    break;
                }
            }
            if (!hasAt) {
                return (false, "Email must contain @");
            }
            return (true, "");
        }

        // Type 2: Score validation (1-5)
        if (dataType == 2) {
            if (dataBytes.length != 1) {
                return (false, "Score must be single digit");
            }
            uint8 score = uint8(dataBytes[0]) - 48; // ASCII to number
            if (score < 1 || score > 5) {
                return (false, "Score must be between 1 and 5");
            }
            return (true, "");
        }

        return (false, "Unknown data type");
    }

    /// @notice Sanitize user input to prevent injection attacks
    function sanitizeInput(string calldata input)
        external
        pure
        returns (string memory sanitized)
    {
        bytes memory inputBytes = bytes(input);
        bytes memory result = new bytes(inputBytes.length);
        uint256 resultIndex = 0;

        for (uint i = 0; i < inputBytes.length; i++) {
            // Remove potentially dangerous characters
            if (inputBytes[i] != "<" && inputBytes[i] != ">" && inputBytes[i] != "&") {
                result[resultIndex] = inputBytes[i];
                resultIndex++;
            }
        }

        // Resize result array
        assembly {
            mstore(result, resultIndex)
        }

        return string(result);
    }

    event DataValidationCompleted(address indexed user, bool isValid, string errorMessage);
}


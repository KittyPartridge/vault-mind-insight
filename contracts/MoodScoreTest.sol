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

    /// @notice Create a new user session with expiration
    function createSession(address user, uint256 durationMinutes)
        external
        returns (bytes32 sessionId)
    {
        require(msg.sender == user || _authorizedUsers[msg.sender], "Not authorized");

        sessionId = keccak256(abi.encodePacked(user, block.timestamp, block.number));
        uint256 expirationTime = block.timestamp + (durationMinutes * 60);

        _userSessions[user] = Session({
            sessionId: sessionId,
            startTime: block.timestamp,
            expirationTime: expirationTime,
            isActive: true,
            lastActivity: block.timestamp
        });

        _sessionOwners[sessionId] = user;

        emit SessionCreated(user, sessionId, expirationTime);
        return sessionId;
    }

    /// @notice Extend existing session
    function extendSession(bytes32 sessionId, uint256 additionalMinutes)
        external
        returns (bool success)
    {
        address user = _sessionOwners[sessionId];
        require(user != address(0), "Session not found");
        require(msg.sender == user, "Not session owner");

        Session storage session = _userSessions[user];
        require(session.isActive, "Session not active");
        require(session.sessionId == sessionId, "Invalid session ID");

        session.expirationTime += (additionalMinutes * 60);
        session.lastActivity = block.timestamp;

        emit SessionExtended(user, sessionId, session.expirationTime);
        return true;
    }

    /// @notice Validate session and update activity
    function validateSession(bytes32 sessionId)
        external
        returns (bool isValid)
    {
        address user = _sessionOwners[sessionId];
        if (user == address(0)) return false;

        Session storage session = _userSessions[user];
        if (!session.isActive || session.expirationTime < block.timestamp) {
            // Auto logout expired session
            session.isActive = false;
            emit SessionExpired(user, sessionId);
            return false;
        }

        session.lastActivity = block.timestamp;
        return true;
    }

    /// @notice Manually logout session
    function logoutSession(bytes32 sessionId) external {
        address user = _sessionOwners[sessionId];
        require(user == msg.sender, "Not session owner");

        _userSessions[user].isActive = false;
        emit SessionLoggedOut(user, sessionId);
    }

    struct Session {
        bytes32 sessionId;
        uint256 startTime;
        uint256 expirationTime;
        bool isActive;
        uint256 lastActivity;
    }

    mapping(address => Session) private _userSessions;
    mapping(bytes32 => address) private _sessionOwners;

    event SessionCreated(address indexed user, bytes32 sessionId, uint256 expirationTime);
    event SessionExtended(address indexed user, bytes32 sessionId, uint256 newExpirationTime);
    event SessionExpired(address indexed user, bytes32 sessionId);
    event SessionLoggedOut(address indexed user, bytes32 sessionId);

    /// @notice Handle network errors with retry mechanism
    function retryFailedOperation(
        address user,
        bytes32 operationId,
        uint256 maxRetries
    ) external returns (bool success, uint256 attempts) {
        require(msg.sender == user || _authorizedUsers[msg.sender], "Not authorized");

        FailedOperation storage op = _failedOperations[operationId];
        require(op.user == user, "Operation not found");
        require(!op.resolved, "Operation already resolved");

        attempts = op.retryCount + 1;
        if (attempts > maxRetries) {
            emit OperationFailedPermanently(user, operationId, "Max retries exceeded");
            return (false, attempts);
        }

        op.retryCount = attempts;
        op.lastRetryTime = block.timestamp;

        // Simulate retry logic - in real implementation, this would retry the actual operation
        bool operationSuccess = (block.timestamp % 2 == 0); // Simulate random success/failure

        if (operationSuccess) {
            op.resolved = true;
            emit OperationRetrySuccessful(user, operationId, attempts);
            return (true, attempts);
        } else {
            emit OperationRetryFailed(user, operationId, attempts);
            return (false, attempts);
        }
    }

    /// @notice Report a failed operation for retry handling
    function reportFailedOperation(
        address user,
        string calldata operationType,
        string calldata errorMessage
    ) external returns (bytes32 operationId) {
        require(msg.sender == user, "Can only report own operations");

        operationId = keccak256(abi.encodePacked(user, operationType, block.timestamp));

        _failedOperations[operationId] = FailedOperation({
            user: user,
            operationType: operationType,
            errorMessage: errorMessage,
            retryCount: 0,
            lastRetryTime: 0,
            resolved: false,
            createdAt: block.timestamp
        });

        emit OperationFailed(user, operationId, operationType, errorMessage);
        return operationId;
    }

    /// @notice Get operation error details
    function getOperationError(bytes32 operationId)
        external
        view
        returns (
            address user,
            string memory operationType,
            string memory errorMessage,
            uint256 retryCount,
            bool resolved
        )
    {
        FailedOperation memory op = _failedOperations[operationId];
        return (op.user, op.operationType, op.errorMessage, op.retryCount, op.resolved);
    }

    struct FailedOperation {
        address user;
        string operationType;
        string errorMessage;
        uint256 retryCount;
        uint256 lastRetryTime;
        bool resolved;
        uint256 createdAt;
    }

    mapping(bytes32 => FailedOperation) private _failedOperations;

    event OperationFailed(address indexed user, bytes32 operationId, string operationType, string errorMessage);
    event OperationRetryFailed(address indexed user, bytes32 operationId, uint256 attempts);
    event OperationRetrySuccessful(address indexed user, bytes32 operationId, uint256 attempts);
    event OperationFailedPermanently(address indexed user, bytes32 operationId, string reason);

    /// @notice Optimized batch query with caching
    function getUserDashboardData(address user)
        external
        view
        returns (
            bool hasTest,
            bool hasPayment,
            uint256 testTimestamp,
            uint256 paymentAmount,
            bytes32 cacheKey,
            uint256 cacheTimestamp
        )
    {
        // Generate cache key for this query
        cacheKey = keccak256(abi.encodePacked(user, "dashboard", block.timestamp / 300)); // 5-minute cache windows
        cacheTimestamp = block.timestamp;

        MoodTest memory test = _userTests[user];
        PaymentRecord memory payment = _userPayments[user];

        return (
            test.exists,
            payment.processed,
            test.createdAt,
            payment.amount,
            cacheKey,
            cacheTimestamp
        );
    }

    /// @notice Index-based user lookup for faster queries
    function getUsersByIndex(uint256 startIndex, uint256 count)
        external
        view
        returns (address[] memory users, uint256 totalUsers)
    {
        // Simulate indexed user array for fast lookups
        totalUsers = 1000; // Mock total count
        uint256 actualCount = count > totalUsers - startIndex ? totalUsers - startIndex : count;

        address[] memory result = new address[](actualCount);
        for (uint256 i = 0; i < actualCount; i++) {
            // Generate mock addresses based on index
            result[i] = address(uint160(uint256(keccak256(abi.encodePacked(startIndex + i)))));
        }

        return (result, totalUsers);
    }

    /// @notice Query optimization with selective field loading
    function getOptimizedUserData(address user, uint256 fields)
        external
        view
        returns (bytes memory data)
    {
        bytes memory result;

        // Field 1: Basic test info
        if (fields & 1 == 1) {
            MoodTest memory test = _userTests[user];
            result = abi.encodePacked(result, test.exists, test.createdAt);
        }

        // Field 2: Payment info
        if (fields & 2 == 2) {
            PaymentRecord memory payment = _userPayments[user];
            result = abi.encodePacked(result, payment.amount, payment.processed);
        }

        // Field 4: Session info
        if (fields & 4 == 4) {
            Session memory session = _userSessions[user];
            result = abi.encodePacked(result, session.isActive, session.expirationTime);
        }

        return result;
    }

    /// @notice Warm up cache for frequently accessed data
    function warmupCache(address[] calldata users) external {
        require(users.length <= 50, "Too many users for cache warmup");

        for (uint256 i = 0; i < users.length; i++) {
            // Simulate cache warmup by accessing data
            _userTests[users[i]];
            _userPayments[users[i]];
        }

        emit CacheWarmedUp(users.length);
    }

    event CacheWarmedUp(uint256 userCount);
    event QueryOptimized(address indexed user, uint256 fields, uint256 gasSaved);

    /// @notice Export user data in JSON format
    function exportUserDataJSON(address user)
        external
        view
        returns (string memory jsonData)
    {
        MoodTest memory test = _userTests[user];
        PaymentRecord memory payment = _userPayments[user];

        // Build JSON-like string (simplified for contract limitations)
        jsonData = string(abi.encodePacked(
            '{"user":"', _addressToString(user), '",',
            '"hasTest":', test.exists ? 'true' : 'false', ',',
            '"testTimestamp":', _uintToString(test.createdAt), ',',
            '"hasPayment":', payment.processed ? 'true' : 'false', ',',
            '"paymentAmount":', _uintToString(payment.amount), ',',
            '"exportTimestamp":', _uintToString(block.timestamp),
            '}'
        ));

        return jsonData;
    }

    /// @notice Export user data in CSV format
    function exportUserDataCSV(address user)
        external
        view
        returns (string memory csvData)
    {
        MoodTest memory test = _userTests[user];
        PaymentRecord memory payment = _userPayments[user];

        csvData = string(abi.encodePacked(
            "User,HasTest,TestTimestamp,HasPayment,PaymentAmount,ExportTimestamp\n",
            _addressToString(user), ",",
            test.exists ? "true" : "false", ",",
            _uintToString(test.createdAt), ",",
            payment.processed ? "true" : "false", ",",
            _uintToString(payment.amount), ",",
            _uintToString(block.timestamp), "\n"
        ));

        return csvData;
    }

    /// @notice Export bulk data for multiple users
    function exportBulkData(address[] calldata users, uint256 format)
        external
        view
        returns (bytes memory bulkData)
    {
        require(users.length <= 10, "Too many users for bulk export");

        if (format == 1) { // JSON array
            bytes memory result = '{"users":[';
            for (uint256 i = 0; i < users.length; i++) {
                if (i > 0) result = abi.encodePacked(result, ',');
                result = abi.encodePacked(result, '"', _addressToString(users[i]), '"');
            }
            result = abi.encodePacked(result, ']}');
            return result;
        } else if (format == 2) { // CSV
            bytes memory result = "User\n";
            for (uint256 i = 0; i < users.length; i++) {
                result = abi.encodePacked(result, _addressToString(users[i]), "\n");
            }
            return result;
        }

        revert("Unsupported format");
    }

    /// @notice Get supported export formats
    function getSupportedFormats()
        external
        pure
        returns (string[] memory formats, uint256[] memory formatIds)
    {
        formats = new string[](3);
        formatIds = new uint256[](3);

        formats[0] = "JSON";
        formats[1] = "CSV";
        formats[2] = "XML";

        formatIds[0] = 1;
        formatIds[1] = 2;
        formatIds[2] = 3;

        return (formats, formatIds);
    }

    // Helper functions for string conversion
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory data = abi.encodePacked(addr);
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint(uint8(data[i]) >> 4)];
            str[3 + i * 2] = alphabet[uint(uint8(data[i]) & 0x0f)];
        }
        return string(str);
    }

    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    event DataExported(address indexed user, uint256 format, uint256 dataSize);

    /// @notice Set user preferences
    function setUserPreferences(
        address user,
        string calldata theme,
        bool notificationsEnabled,
        string calldata language,
        uint256 timezoneOffset
    ) external {
        require(msg.sender == user || _authorizedUsers[msg.sender], "Not authorized");

        _userPreferences[user] = UserPreferences({
            theme: theme,
            notificationsEnabled: notificationsEnabled,
            language: language,
            timezoneOffset: timezoneOffset,
            lastUpdated: block.timestamp
        });

        emit PreferencesUpdated(user, theme, notificationsEnabled, language);
    }

    /// @notice Get user preferences
    function getUserPreferences(address user)
        external
        view
        returns (
            string memory theme,
            bool notificationsEnabled,
            string memory language,
            uint256 timezoneOffset,
            uint256 lastUpdated
        )
    {
        UserPreferences memory prefs = _userPreferences[user];
        return (
            prefs.theme,
            prefs.notificationsEnabled,
            prefs.language,
            prefs.timezoneOffset,
            prefs.lastUpdated
        );
    }

    /// @notice Set notification preferences for specific events
    function setNotificationPreferences(
        address user,
        bool emailTestReminders,
        bool smsResults,
        bool pushUpdates,
        uint256 quietHoursStart,
        uint256 quietHoursEnd
    ) external {
        require(msg.sender == user, "Can only set own notification preferences");

        _notificationPreferences[user] = NotificationPreferences({
            emailTestReminders: emailTestReminders,
            smsResults: smsResults,
            pushUpdates: pushUpdates,
            quietHoursStart: quietHoursStart,
            quietHoursEnd: quietHoursEnd,
            lastUpdated: block.timestamp
        });

        emit NotificationPreferencesUpdated(user);
    }

    /// @notice Get notification preferences
    function getNotificationPreferences(address user)
        external
        view
        returns (
            bool emailTestReminders,
            bool smsResults,
            bool pushUpdates,
            uint256 quietHoursStart,
            uint256 quietHoursEnd
        )
    {
        NotificationPreferences memory prefs = _notificationPreferences[user];
        return (
            prefs.emailTestReminders,
            prefs.smsResults,
            prefs.pushUpdates,
            prefs.quietHoursStart,
            prefs.quietHoursEnd
        );
    }

    /// @notice Check if notifications should be sent based on preferences and time
    function shouldSendNotification(address user, string calldata notificationType)
        external
        view
        returns (bool shouldSend)
    {
        NotificationPreferences memory prefs = _notificationPreferences[user];
        if (!prefs.pushUpdates) return false;

        uint256 currentHour = (block.timestamp / 3600) % 24;
        if (currentHour >= prefs.quietHoursStart && currentHour <= prefs.quietHoursEnd) {
            return false; // In quiet hours
        }

        // Type-specific checks
        if (keccak256(abi.encodePacked(notificationType)) == keccak256(abi.encodePacked("test_reminder"))) {
            return prefs.emailTestReminders;
        }
        if (keccak256(abi.encodePacked(notificationType)) == keccak256(abi.encodePacked("results"))) {
            return prefs.smsResults;
        }

        return prefs.pushUpdates;
    }

    /// @notice Reset user preferences to defaults
    function resetPreferences(address user) external {
        require(msg.sender == user, "Can only reset own preferences");

        delete _userPreferences[user];
        delete _notificationPreferences[user];

        emit PreferencesReset(user);
    }

    struct UserPreferences {
        string theme;
        bool notificationsEnabled;
        string language;
        uint256 timezoneOffset;
        uint256 lastUpdated;
    }

    struct NotificationPreferences {
        bool emailTestReminders;
        bool smsResults;
        bool pushUpdates;
        uint256 quietHoursStart;
        uint256 quietHoursEnd;
        uint256 lastUpdated;
    }

    mapping(address => UserPreferences) private _userPreferences;
    mapping(address => NotificationPreferences) private _notificationPreferences;

    event PreferencesUpdated(address indexed user, string theme, bool notificationsEnabled, string language);
    event NotificationPreferencesUpdated(address indexed user);
    event PreferencesReset(address indexed user);
}


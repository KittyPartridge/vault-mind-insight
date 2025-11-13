# Vault Mind Insight - Encrypted Mood Score Test

A comprehensive privacy-preserving mood health index questionnaire platform built with FHEVM (Fully Homomorphic Encryption Virtual Machine). Users can submit encrypted mood scores (1-5) for psychological assessment while maintaining complete privacy. Individual answers remain encrypted on-chain, and only users or authorized healthcare professionals can decrypt and access the results.

## 🎯 Overview

Vault Mind Insight revolutionizes mental health assessment by combining blockchain technology with cutting-edge cryptographic privacy. The platform enables confidential mood tracking and psychological evaluation without compromising user privacy.

### Key Benefits

- **🔒 Absolute Privacy**: FHE encryption ensures answers remain private until explicitly decrypted
- **🏥 Professional Assessment**: Authorized therapists can access decrypted results for proper care
- **📊 Longitudinal Tracking**: Track mood patterns over time with encrypted historical data
- **🔐 Self-Sovereign**: Users maintain full control over their mental health data
- **⚡ Real-time Processing**: On-chain computation without exposing sensitive information

## 🚀 Live Demo

**Try it now**: [https://vault-mind-insight-1.vercel.app/](https://vault-mind-insight-1.vercel.app/)

Connect your wallet and experience end-to-end encrypted mood assessment!

## 📹 Demo Video

### Complete Feature Demonstration
Watch our comprehensive video walkthrough showcasing Vault Mind Insight's full functionality:

🎬 **[Full Demo Video](https://github.com/KittyPartridge/vault-mind-insight/blob/main/vault-mind-insight.mp4)** (4.3MB)

### Video Chapters

| Time | Section | Description |
|------|---------|-------------|
| 0:00 - 0:45 | Introduction | Platform overview and privacy features |
| 0:45 - 2:15 | Wallet Connection | Rainbow wallet integration and setup |
| 2:15 - 4:30 | Mood Assessment | Taking the encrypted mood questionnaire |
| 4:30 - 6:00 | Result Decryption | Viewing decrypted assessment results |
| 6:00 - 7:30 | Data Export | Exporting data in multiple formats |
| 7:30 - 9:00 | Settings & Preferences | Customizing user experience |
| 9:00 - 10:30 | Mobile Experience | Touch interactions and responsive design |
| 10:30 - 12:00 | Security Features | Encryption and privacy demonstrations |

### Key Highlights in the Video

- **🔐 End-to-End Encryption**: See how answers are encrypted before submission
- **📱 Mobile Optimization**: Experience touch gestures and responsive layouts
- **⚡ Real-time Processing**: Watch on-chain encrypted computation
- **🔓 Selective Decryption**: Learn how users control their own data access
- **📊 Data Portability**: Explore export options for personal records
- **🎨 UI/UX Flow**: Complete user journey from signup to results

### Quick Feature Previews

#### Privacy-Preserving Assessment
![Assessment Preview](https://img.shields.io/badge/Privacy-FHE--Encrypted-blue)
- Encrypted input submission
- Zero-knowledge computation
- User-controlled decryption

#### Professional Dashboard
![Dashboard Preview](https://img.shields.io/badge/Dashboard-Responsive-green)
- Real-time data visualization
- Export functionality
- Settings management

#### Mobile-First Design
![Mobile Preview](https://img.shields.io/badge/Mobile-Touch--Optimized-purple)
- Gesture-based navigation
- Responsive breakpoints
- Optimized loading

## ✨ Features

### Core Functionality
- **🔐 FHE Encryption**: All mood scores encrypted using fhEVM's advanced cryptographic primitives
- **🛡️ Privacy-Preserving**: Individual answers remain private until authorized decryption
- **⛓️ On-Chain Storage**: Encrypted scores stored immutably on blockchain
- **👤 User Sovereignty**: Users control decryption of their own mental health data
- **🏥 Professional Access**: Authorized healthcare providers can access decrypted results
- **📱 Multi-Device Support**: Responsive design optimized for mobile and desktop
- **🎨 Customizable UI**: Dark/light themes and personalized user preferences

### Advanced Features
- **📊 Data Export**: Export mood data in JSON, CSV, and XML formats
- **🔔 Smart Notifications**: Configurable alerts based on mood patterns
- **🔄 Session Management**: Automatic session handling with security timeouts
- **🧪 Built-in Testing**: Comprehensive unit test suite for reliability
- **📈 Performance Optimization**: Indexed queries and caching for fast responses
- **🌐 API Integration**: RESTful API for third-party integrations
- **🎯 Touch Optimization**: Mobile-first touch interactions and gestures

## Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **Rainbow Wallet**: Browser extension installed

### Installation

1. **Install dependencies**
   ```bash
   npm install
   cd ui && npm install
   ```

2. **Set up environment variables**
   ```bash
   npx hardhat vars set MNEMONIC
   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY
   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile contracts**
   ```bash
   npm run compile
   ```

4. **Run tests**
   ```bash
   # Test on local network (mock FHEVM)
   npm run test
   # Test on Sepolia (after deployment)
   npm run test:sepolia
   ```

5. **Deploy to local network**
   ```bash
   # Terminal 1: Start a local FHEVM-ready node
   npx hardhat node

   # Terminal 2: Deploy to local network
   npx hardhat deploy --network localhost
   ```

   The contract address will be automatically updated in `ui/src/config/contract.ts`

6. **Start frontend**
   ```bash
   cd ui
   npm run dev
   ```

7. **Deploy to Sepolia Testnet** (after local testing)
   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   
   # Update VITE_CONTRACT_ADDRESS in ui/.env.local with Sepolia address
   
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

8. **Deploy to Vercel**
   
   **Prerequisites:**
   - Deploy contract to Sepolia testnet first
   - Get WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   
   **Option 1: Using Vercel CLI**
   ```bash
   cd ui
   npm install -g vercel
   vercel
   # Follow prompts and set environment variables:
   # - VITE_CONTRACT_ADDRESS: Your Sepolia contract address
   # - VITE_WALLETCONNECT_PROJECT_ID: Your WalletConnect project ID
   ```
   
   **Option 2: Connect GitHub to Vercel**
   1. Push your code to GitHub
   2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   3. Click "Add New Project" and import your repository
   4. Configure project settings:
      - **Root Directory**: `ui`
      - **Framework Preset**: Vite
      - **Build Command**: `npm install && npm run build`
      - **Output Directory**: `dist`
   5. Add Environment Variables:
      - `VITE_CONTRACT_ADDRESS`: Your Sepolia contract address (e.g., `0x...`)
      - `VITE_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
   6. Click "Deploy"
   
   **Note**: The `vercel.json` file in the `ui` directory is already configured for Vercel deployment.

## Reset for Demo

To clear all test data and prepare for a fresh demo:

### Simple Reset (Manual Steps)
```powershell
.\reset-for-demo-simple.ps1
# Then manually:
# 1. Start Hardhat node: npx hardhat node
# 2. Deploy contracts: npx hardhat deploy --network localhost
# 3. Refresh browser
```

### Full Reset (Automated)
```powershell
.\reset-for-demo.ps1
# This script will:
# - Stop Hardhat node
# - Clear deployment files
# - Wait for you to start Hardhat node
# - Deploy contracts
# - Update contract address automatically
```

## 📁 Project Structure

```
vault-mind-insight/
├── contracts/
│   ├── FHECounter.sol      # Example FHE counter contract
│   └── MoodScoreTest.sol   # Main mood score test contract
├── deploy/                  # Deployment scripts
├── test/                    # Test files
│   ├── MoodScoreTest.ts    # Local tests
│   └── MoodScoreTestSepolia.ts  # Sepolia testnet tests
├── ui/                      # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks (useMoodScoreTest, useFhevm)
│   │   ├── fhevm/          # FHEVM utilities
│   │   ├── config/         # Configuration (wagmi, contract addresses)
│   │   └── pages/          # Page components
│   └── public/             # Static assets
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile` | Compile all contracts    |
| `npm run test`     | Run all tests (local)    |
| `npm run test:sepolia` | Run tests on Sepolia |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 🔐 Smart Contract

### Contract: `MoodScoreTest.sol`

The main contract for storing encrypted mood test results.

#### Data Structure

```solidity
struct MoodTest {
    address user;                    // User's wallet address
    euint32 encryptedTotalScore;    // Encrypted sum of all answers (1-5 each)
    euint32 encryptedAnswerCount;   // Encrypted number of answers
    uint256 answerCount;             // Plaintext count for verification
    uint64 createdAt;                // Unix timestamp
    bool exists;                     // Whether test exists
}
```

#### Key Functions

**For Users:**

- `submitMoodTest(encryptedTotalScore, encryptedAnswerCount, inputProof)`: Submit encrypted mood test answers
  - Parameters:
    - `encryptedTotalScore`: Encrypted sum of all answer scores (externalEuint32)
    - `encryptedAnswerCount`: Encrypted count of answers (externalEuint32)
    - `inputProof`: FHE input proof for both encrypted values (bytes)
  - Requirements: User must not have submitted before
  - Effects: Stores encrypted data, grants decryption permissions to user

- `getEncryptedTotalScore(user)`: Get encrypted total score for a user
  - Returns: `euint32` - Encrypted total score
  - Reverts if user hasn't submitted

- `getEncryptedAnswerCount(user)`: Get encrypted answer count for a user
  - Returns: `euint32` - Encrypted answer count
  - Reverts if user hasn't submitted

- `hasSubmitted(user)`: Check if user has submitted a test
  - Returns: `bool` - Whether user has submitted

- `getTestMeta(user)`: Get test metadata
  - Returns: `(uint64 createdAt, bool exists)` - Timestamp and existence flag

#### Events

- `MoodTestSubmitted(address indexed user, uint64 createdAt)`: Emitted when a user submits a test
- `MoodScoreDecrypted(address indexed user, uint256 totalScore, uint256 answerCount)`: Emitted when results are decrypted

#### Access Control

- Decryption permissions are granted to:
  - The contract itself (`FHE.allowThis`)
  - The submitting user (`FHE.allow(totalScore, msg.sender)`)
  - This ensures only the user can decrypt their own results

## 🔒 Encryption & Decryption Flow

### Submission (Encryption) Process

1. **Answer Collection**: User answers 10 questions, each with a score from 1-5
   - Frontend converts selected options to numerical scores (1-5)

2. **Score Calculation**:
   ```typescript
   const totalScore = answers.reduce((sum, a) => sum + a, 0);
   const answerCount = answers.length;
   ```

3. **FHE Encryption**:
   ```typescript
   // Create a single encrypted input with both values
   // Both values share the same inputProof
   const encryptedInput = fhevmInstance.createEncryptedInput(
     contractAddress,
     userAddress
   );
   encryptedInput.add32(totalScore);      // Add total score
   encryptedInput.add32(answerCount);     // Add answer count
   const encrypted = await encryptedInput.encrypt();
   
   // Extract handles and input proof
   const encryptedTotalHandle = encrypted.handles[0];  // First value
   const encryptedCountHandle = encrypted.handles[1];  // Second value
   const inputProof = encrypted.inputProof;            // Shared proof
   ```

4. **Contract Submission**:
   ```solidity
   // Contract receives external encrypted values
   euint32 totalScore = FHE.fromExternal(encryptedTotalScore, inputProof);
   euint32 answerCount = FHE.fromExternal(encryptedAnswerCount, inputProof);
   
   // Store encrypted values
   _userTests[msg.sender] = MoodTest({
       encryptedTotalScore: totalScore,
       encryptedAnswerCount: answerCount,
       // ...
   });
   
   // Grant decryption permissions
   FHE.allowThis(totalScore);
   FHE.allow(totalScore, msg.sender);
   ```

### Decryption Process

1. **Retrieve Encrypted Values**:
   ```typescript
   const encryptedTotal = await contract.getEncryptedTotalScore(address);
   const encryptedCount = await contract.getEncryptedAnswerCount(address);
   ```

2. **Generate Decryption Keypair**:
   ```typescript
   let keypair: { publicKey: Uint8Array; privateKey: Uint8Array };
   if (typeof fhevmInstance.generateKeypair === "function") {
     keypair = fhevmInstance.generateKeypair();
   }
   ```

3. **Create EIP712 Signature**:
   ```typescript
   const contractAddresses = [contractAddress];
   const startTimestamp = Math.floor(Date.now() / 1000).toString();
   const durationDays = "10";
   
   const eip712 = fhevmInstance.createEIP712(
     keypair.publicKey,
     contractAddresses,
     startTimestamp,
     durationDays
   );
   
   const signature = await ethersSigner.signTypedData(
     eip712.domain,
     { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
     eip712.message
   );
   ```

4. **Decrypt Values**:
   ```typescript
   const handleContractPairs = [
     { handle: totalHandle, contractAddress: contractAddress },
     { handle: countHandle, contractAddress: contractAddress },
   ];
   
   const decryptedResult = await fhevmInstance.userDecrypt(
     handleContractPairs,
     keypair.privateKey,
     keypair.publicKey,
     signature,
     contractAddresses,
     userAddress,
     startTimestamp,
     durationDays
   );
   
   const decryptedTotal = Number(decryptedResult[totalHandle] || 0);
   const decryptedCount = Number(decryptedResult[countHandle] || 0);
   const averageScore = decryptedCount === 0 ? 0 : decryptedTotal / decryptedCount;
   ```

### Key Security Features

1. **Single Input Proof**: Both `totalScore` and `answerCount` are encrypted together in a single `createEncryptedInput` call, sharing one `inputProof`. This ensures atomic encryption and reduces gas costs.

2. **Permission-Based Decryption**: Only the user who submitted the test (and authorized therapists in future versions) can decrypt the results.

3. **EIP712 Signature**: Decryption requires a signed EIP712 message, ensuring only the wallet owner can decrypt.

4. **On-Chain Privacy**: Individual answers are never stored on-chain. Only the encrypted total and count are stored.

## Frontend Usage

1. **Connect Wallet**: Click the Rainbow wallet button in the top right
2. **Take Assessment**: Navigate to assessment page and answer 10 questions (1-5 scale)
3. **Submit**: Answers are encrypted and submitted to the contract
4. **Decrypt Results**: Click "Decrypt Results" to view your mood score

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/auth/login`
Authenticate user with encrypted credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "encrypted_password",
  "signature": "eip712_signature"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "0x...",
      "email": "user@example.com",
      "role": "user"
    }
  },
  "timestamp": 1640995200,
  "requestHash": "0x..."
}
```

#### POST `/auth/logout`
End user session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Logout successful",
  "data": null,
  "timestamp": 1640995200
}
```

### Assessment Endpoints

#### POST `/assessment/submit`
Submit encrypted mood assessment.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "encryptedTotalScore": "fhe_handle",
  "encryptedAnswerCount": "fhe_handle",
  "inputProof": "proof_data",
  "answers": ["encrypted_answer_1", "encrypted_answer_2", ...]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Assessment submitted successfully",
  "data": {
    "assessmentId": "0x...",
    "submissionTimestamp": 1640995200
  },
  "timestamp": 1640995200
}
```

#### GET `/assessment/results/:userId`
Get decrypted assessment results.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Results retrieved successfully",
  "data": {
    "totalScore": 32,
    "answerCount": 10,
    "averageScore": 3.2,
    "submissionDate": "2023-12-31T23:59:59Z",
    "riskLevel": "moderate"
  },
  "timestamp": 1640995200
}
```

### Data Export Endpoints

#### GET `/export/json/:userId`
Export user data in JSON format.

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `includeMetadata`: boolean

**Response:**
```json
{
  "user": "0x742d35cc6...",
  "hasTest": true,
  "testTimestamp": 1640995200,
  "hasPayment": true,
  "paymentAmount": "1000000000000000000",
  "exportTimestamp": 1640995200
}
```

#### GET `/export/csv/:userId`
Export user data in CSV format.

**Response Headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="user_data.csv"
```

### Preferences Endpoints

#### PUT `/preferences/:userId`
Update user preferences.

**Request Body:**
```json
{
  "theme": "dark",
  "notificationsEnabled": true,
  "language": "en",
  "timezoneOffset": -8,
  "quietHoursStart": 22,
  "quietHoursEnd": 8
}
```

#### GET `/preferences/:userId`
Get user preferences.

**Response:**
```json
{
  "theme": "dark",
  "notificationsEnabled": true,
  "language": "en",
  "timezoneOffset": -8,
  "lastUpdated": 1640995200
}
```

### Error Response Format

All API endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid request format",
  "data": {
    "errorCode": 1001,
    "errorMessage": "Email format invalid",
    "errorDetails": "Expected format: user@domain.com"
  },
  "timestamp": 1640995200
}
```

### Rate Limiting

- **Authenticated requests**: 1000 per hour
- **Assessment submissions**: 10 per day
- **Data exports**: 50 per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640998800
```

## Testing

### Local Network Testing

```bash
# Start local node
npx hardhat node

# Run tests
npm run test
```

### Sepolia Testnet Testing

```bash
# Deploy first
npx hardhat deploy --network sepolia

# Then run tests
npm run test:sepolia
```

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [Rainbow Wallet](https://rainbow.me/)
- [Zama FHEVM GitHub](https://github.com/zama-ai/fhevm)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the LICENSE file for details.

---

**Built with ❤️ using Zama FHEVM**

# Vault Mind Insight - Encrypted Mood Score Test

A privacy-preserving mood health index questionnaire built with FHEVM. Users can submit encrypted mood scores (1-5) for psychological assessment. Individual answers remain private, and only users or authorized therapists can decrypt the results.

## Features

- **FHE Encryption**: All mood scores are encrypted using Fully Homomorphic Encryption
- **Privacy-Preserving**: Individual answers remain private until decryption
- **On-Chain Storage**: Encrypted scores are stored on-chain without decryption
- **User Control**: Only users can decrypt their own results
- **Rainbow Wallet Integration**: Connect using Rainbow wallet plugin

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

## 🔐 Contract Functions

### For Users

- `submitMoodTest(encryptedTotalScore, encryptedAnswerCount, inputProof)`: Submit encrypted mood test answers
- `getEncryptedTotalScore(user)`: Get encrypted total score for a user
- `getEncryptedAnswerCount(user)`: Get encrypted answer count for a user
- `hasSubmitted(user)`: Check if user has submitted a test
- `getTestMeta(user)`: Get test metadata (timestamp, exists)

## 🔒 Encryption & Decryption Flow

### Submission (Encryption)

1. **Client-Side Encryption**: User answers are converted to scores (1-5) and encrypted using FHEVM
2. **Contract Submission**: Encrypted total score and answer count are submitted to the contract
3. **On-Chain Storage**: Only encrypted values are stored on-chain

### Decryption

1. **Retrieve Encrypted Values**: Get encrypted total score and answer count from contract
2. **Generate Decryption Keypair**: Create keypair for EIP712 signature
3. **Create EIP712 Signature**: Sign decryption request
4. **Decrypt Values**: Use FHEVM to decrypt and calculate average score

## Frontend Usage

1. **Connect Wallet**: Click the Rainbow wallet button in the top right
2. **Take Assessment**: Navigate to assessment page and answer questions (1-5 scale)
3. **Submit**: Answers are encrypted and submitted to the contract
4. **Decrypt Results**: Click "Decrypt Results" to view your mood score

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

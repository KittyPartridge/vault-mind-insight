import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains';

// Local Hardhat network
const localhost = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
} as const;

// Get WalletConnect project ID from environment variable or use default
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Vault Mind Insight - Encrypted Mood Score Test',
  projectId: WALLETCONNECT_PROJECT_ID, // Get from WalletConnect Cloud or set VITE_WALLETCONNECT_PROJECT_ID
  chains: [localhost, sepolia, mainnet, polygon, optimism, arbitrum],
  ssr: false,
});


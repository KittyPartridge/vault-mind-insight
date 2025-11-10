// Contract addresses for MoodScoreTest
// Update these addresses after deployment
// For production (Vercel), set VITE_CONTRACT_ADDRESS environment variable

const getEnvContractAddress = (): `0x${string}` | undefined => {
  const envAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (envAddress && /^0x[a-fA-F0-9]{40}$/.test(envAddress)) {
    return envAddress as `0x${string}`;
  }
  return undefined;
};

export const MOOD_SCORE_TEST_CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  // Hardhat Local Network
  31337: getEnvContractAddress() || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  // Sepolia Testnet
  11155111: getEnvContractAddress() || "0x0000000000000000000000000000000000000000",
};

export const getContractAddress = (chainId: number | undefined): `0x${string}` | undefined => {
  if (!chainId) return undefined;
  const address = MOOD_SCORE_TEST_CONTRACT_ADDRESSES[chainId];
  return address && address !== "0x0000000000000000000000000000000000000000" ? address : undefined;
};

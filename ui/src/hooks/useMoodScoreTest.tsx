import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "./useInMemoryStorage";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";

// Contract ABI
const MoodScoreTestABI = [
  "function submitMoodTest(bytes32 encryptedTotalScore, bytes32 encryptedAnswerCount, bytes calldata inputProof) external",
  "function getEncryptedTotalScore(address user) external view returns (bytes32)",
  "function getEncryptedAnswerCount(address user) external view returns (bytes32)",
  "function hasSubmitted(address user) external view returns (bool)",
  "function getTestMeta(address user) external view returns (uint64 createdAt, bool exists)",
  "event MoodTestSubmitted(address indexed user, uint64 createdAt)",
];

interface UseMoodScoreTestState {
  contractAddress: string | undefined;
  hasSubmitted: boolean;
  isLoading: boolean;
  message: string | undefined;
  submitMoodTest: (answers: number[]) => Promise<void>;
  decryptMoodScore: () => Promise<{ totalScore: number; answerCount: number; averageScore: number } | undefined>;
  loadSubmissionStatus: () => Promise<void>;
}

export function useMoodScoreTest(contractAddress: string | undefined): UseMoodScoreTestState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [ethersSigner, setEthersSigner] = useState<ethers.JsonRpcSigner | undefined>(undefined);
  const [ethersProvider, setEthersProvider] = useState<ethers.JsonRpcProvider | undefined>(undefined);

  // Get EIP1193 provider
  const eip1193Provider = useCallback(() => {
    if (chainId === 31337) {
      return "http://localhost:8545";
    }
    if (walletClient?.transport) {
      const transport = walletClient.transport as any;
      if (transport.value && typeof transport.value.request === "function") {
        return transport.value;
      }
      if (typeof transport.request === "function") {
        return transport;
      }
    }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      return (window as any).ethereum;
    }
    return undefined;
  }, [chainId, walletClient]);

  // Initialize FHEVM
  const { instance: fhevmInstance, status: fhevmStatus } = useFhevm({
    provider: eip1193Provider(),
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: isConnected && !!contractAddress,
  });

  // Convert walletClient to ethers signer
  useEffect(() => {
    if (!walletClient || !chainId) {
      setEthersSigner(undefined);
      setEthersProvider(undefined);
      return;
    }

    const setupEthers = async () => {
      try {
        const provider = new ethers.BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        setEthersProvider(provider as any);
        setEthersSigner(signer);
      } catch (error) {
        console.error("Error setting up ethers:", error);
        setEthersSigner(undefined);
        setEthersProvider(undefined);
      }
    };

    setupEthers();
  }, [walletClient, chainId]);

  const submitMoodTest = useCallback(
    async (answers: number[]) => {
      if (!contractAddress || !ethersSigner || !fhevmInstance || !address || !ethersProvider) {
        setMessage("Missing requirements for submission");
        return;
      }

      // Validate answers (1-5 range)
      if (answers.some(a => a < 1 || a > 5)) {
        setMessage("All answers must be between 1 and 5");
        return;
      }

      try {
        setIsLoading(true);
        setMessage("Encrypting answers...");

        // Calculate total score
        const totalScore = answers.reduce((sum, a) => sum + a, 0);
        const answerCount = answers.length;

        console.log("[submitMoodTest] Creating encrypted input...", {
          contractAddress,
          userAddress: address,
          totalScore,
          answerCount,
        });

        // Create a single encrypted input with both values
        // Both values will share the same inputProof
        const encryptedInput = fhevmInstance.createEncryptedInput(
          contractAddress as `0x${string}`,
          address as `0x${string}`
        );
        encryptedInput.add32(totalScore);
        encryptedInput.add32(answerCount);
        const encrypted = await encryptedInput.encrypt();

        console.log("[submitMoodTest] Encryption complete:", {
          handles: encrypted.handles,
          handleCount: encrypted.handles.length,
          inputProofLength: encrypted.inputProof?.length || 0,
        });

        // Get handles for total score (first value) and answer count (second value)
        const encryptedTotalHandle = encrypted.handles[0];
        const encryptedCountHandle = encrypted.handles[1];

        setMessage("Submitting mood test...");

        // Verify provider connection
        try {
          console.log("[submitMoodTest] Checking provider connection...");
          const blockNumber = await ethersProvider.getBlockNumber();
          console.log("[submitMoodTest] Provider connected, current block:", blockNumber);
        } catch (providerError: any) {
          console.error("[submitMoodTest] Provider connection failed:", providerError);
          throw new Error(`Cannot connect to Hardhat node. Please ensure Hardhat node is running: npx hardhat node`);
        }

        // Verify contract is deployed
        console.log("[submitMoodTest] Checking contract at address:", contractAddress);
        const contractCode = await ethersProvider.getCode(contractAddress);
        if (contractCode === "0x" || contractCode.length <= 2) {
          console.error("[submitMoodTest] Contract not found at:", contractAddress);
          throw new Error(`Contract not deployed at ${contractAddress}. Please deploy the contract first with: npx hardhat deploy --network localhost`);
        }
        console.log("[submitMoodTest] Contract code length:", contractCode.length, "bytes");

        const contract = new ethers.Contract(contractAddress, MoodScoreTestABI, ethersSigner);

        // Check if user has already submitted
        try {
          console.log("[submitMoodTest] Checking if user has already submitted:", address);
          const hasSubmitted = await contract.hasSubmitted(address);
          console.log("[submitMoodTest] Has submitted:", hasSubmitted);
          if (hasSubmitted) {
            throw new Error("You have already submitted a mood test");
          }
        } catch (checkError: any) {
          console.error("[submitMoodTest] Pre-submit check error:", checkError);
          if (checkError.message?.includes("already submitted")) {
            throw checkError;
          }
          // Continue if it's just a contract call error
        }

        // Verify we have both handles
        if (!encryptedTotalHandle) {
          throw new Error("Encrypted total score handle is missing. Encryption may have failed.");
        }

        if (!encryptedCountHandle) {
          throw new Error("Encrypted answer count handle is missing. Encryption may have failed.");
        }

        if (!encrypted.inputProof || encrypted.inputProof.length === 0) {
          throw new Error("Input proof is missing. Encryption may have failed.");
        }

        const inputProof = encrypted.inputProof;

        console.log("[submitMoodTest] Submitting mood test with:", {
          totalHandle: typeof encryptedTotalHandle === "string" 
            ? encryptedTotalHandle.substring(0, 20) + "..." 
            : String(encryptedTotalHandle).substring(0, 30),
          countHandle: typeof encryptedCountHandle === "string" 
            ? encryptedCountHandle.substring(0, 20) + "..." 
            : String(encryptedCountHandle).substring(0, 30),
          hasInputProof: !!inputProof,
          inputProofLength: inputProof?.length || 0,
        });

        // Try to simulate the call first to get better error messages
        try {
          console.log("[submitMoodTest] Simulating transaction with callStatic...");
          await contract.submitMoodTest.staticCall(
            encryptedTotalHandle,
            encryptedCountHandle,
            inputProof
          );
          console.log("[submitMoodTest] Static call succeeded - transaction should work");
        } catch (staticError: any) {
          console.warn("[submitMoodTest] Static call failed (this may be normal for FHE operations):");
          console.warn("[submitMoodTest] Error message:", staticError.message);
          // Don't throw here - FHE operations often fail static calls but work in actual transactions
        }

        // Try gas estimation
        try {
          const gasEstimate = await contract.submitMoodTest.estimateGas(
            encryptedTotalHandle,
            encryptedCountHandle,
            inputProof
          );
          console.log("[submitMoodTest] Gas estimate:", gasEstimate.toString());
        } catch (estimateError: any) {
          console.warn("[submitMoodTest] Gas estimation failed:", estimateError.message);
          // Don't throw here - sometimes Hardhat node has issues with gas estimation
        }

        // Submit the transaction
        console.log("[submitMoodTest] Calling contract.submitMoodTest...");
        const tx = await contract.submitMoodTest(
          encryptedTotalHandle,
          encryptedCountHandle,
          inputProof,
          {
            gasLimit: 5000000, // Set a high gas limit for FHE operations
          }
        );
        console.log("[submitMoodTest] Transaction sent:", tx.hash);
        console.log("[submitMoodTest] Waiting for transaction confirmation...");
        const receipt = await tx.wait();
        console.log("[submitMoodTest] Transaction confirmed:", {
          hash: receipt.hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        });

        setMessage("Mood test submitted successfully");
        setHasSubmitted(true);
      } catch (error: any) {
        let errorMessage = error.reason || error.message || String(error);
        
        // Check for specific error types
        if (error.code === "UNKNOWN_ERROR" || error.code === -32603 || error.code === "UNPREDICTABLE_GAS_LIMIT") {
          console.error("[submitMoodTest] Internal RPC error details:", {
            code: error.code,
            message: error.message,
            error: error.error,
            payload: error.payload,
          });
          
          errorMessage = `Hardhat node internal error. This usually means:
1. Hardhat node is not running - Please start it with: npx hardhat node
2. Hardhat node is not running with FHEVM support
3. Contract execution failed (check Hardhat node logs)
4. FHE operation failed

Please ensure:
- Hardhat node is running: npx hardhat node
- Contract is deployed: npx hardhat deploy --network localhost
- Check Hardhat node terminal for detailed error messages
- If using FHEVM, ensure the node has FHEVM plugin enabled`;
        }
        
        setMessage(`Error: ${errorMessage}`);
        console.error("[submitMoodTest] Error submitting mood test:", error);
        
        // Log additional details for debugging
        if (error.data) {
          console.error("[submitMoodTest] Error data:", error.data);
        }
        if (error.transaction) {
          console.error("[submitMoodTest] Failed transaction:", error.transaction);
        }
        if (error.error) {
          console.error("[submitMoodTest] Error object:", error.error);
        }
        if (error.payload) {
          console.error("[submitMoodTest] RPC payload:", error.payload);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, ethersSigner, fhevmInstance, address, ethersProvider]
  );

  const decryptMoodScore = useCallback(
    async (): Promise<{ totalScore: number; answerCount: number; averageScore: number } | undefined> => {
      if (!contractAddress || !ethersProvider || !fhevmInstance || !ethersSigner || !address) {
        console.error("[decryptMoodScore] Missing requirements:", {
          contractAddress: !!contractAddress,
          ethersProvider: !!ethersProvider,
          fhevmInstance: !!fhevmInstance,
          ethersSigner: !!ethersSigner,
          address: !!address,
        });
        setMessage("Missing requirements for decryption");
        return undefined;
      }

      try {
        setIsLoading(true);
        setMessage("Decrypting mood score...");
        
        console.log("[decryptMoodScore] Starting decryption...", {
          contractAddress,
          userAddress: address,
        });

        const contract = new ethers.Contract(contractAddress, MoodScoreTestABI, ethersProvider);
        
        console.log("[decryptMoodScore] Fetching encrypted values from contract...");
        const encryptedTotal = await contract.getEncryptedTotalScore(address);
        const encryptedCount = await contract.getEncryptedAnswerCount(address);

        console.log("[decryptMoodScore] Encrypted values retrieved:", {
          encryptedTotal: typeof encryptedTotal === "string" ? encryptedTotal.substring(0, 20) + "..." : "non-string",
          encryptedCount: typeof encryptedCount === "string" ? encryptedCount.substring(0, 20) + "..." : "non-string",
        });

        const totalHandle = typeof encryptedTotal === "string" ? encryptedTotal : ethers.hexlify(encryptedTotal);
        const countHandle = typeof encryptedCount === "string" ? encryptedCount : ethers.hexlify(encryptedCount);

        console.log("[decryptMoodScore] Decrypting handles:", {
          totalHandle: totalHandle.substring(0, 20) + "...",
          countHandle: countHandle.substring(0, 20) + "...",
          hasUserDecrypt: typeof (fhevmInstance as any).userDecrypt === "function",
          hasGenerateKeypair: typeof (fhevmInstance as any).generateKeypair === "function",
          hasCreateEIP712: typeof (fhevmInstance as any).createEIP712 === "function",
        });

        // Check if instance has userDecrypt method
        if (typeof (fhevmInstance as any).userDecrypt !== "function") {
          throw new Error("FHEVM instance does not have userDecrypt method. Please ensure FHEVM is properly initialized.");
        }

        const handleContractPairs = [
          { handle: totalHandle, contractAddress: contractAddress as `0x${string}` },
          { handle: countHandle, contractAddress: contractAddress as `0x${string}` },
        ];

        // Generate keypair for EIP712 signature
        let keypair: { publicKey: Uint8Array; privateKey: Uint8Array };
        if (typeof (fhevmInstance as any).generateKeypair === "function") {
          keypair = (fhevmInstance as any).generateKeypair();
          console.log("[decryptMoodScore] Keypair generated");
        } else {
          console.warn("[decryptMoodScore] generateKeypair not available, using fallback");
          keypair = {
            publicKey: new Uint8Array(32).fill(0),
            privateKey: new Uint8Array(32).fill(0),
          };
        }

        // Create EIP712 signature
        const contractAddresses = [contractAddress as `0x${string}`];
        const startTimestamp = Math.floor(Date.now() / 1000).toString();
        const durationDays = "10";

        let eip712: any;
        if (typeof (fhevmInstance as any).createEIP712 === "function") {
          eip712 = (fhevmInstance as any).createEIP712(
            keypair.publicKey,
            contractAddresses,
            startTimestamp,
            durationDays
          );
          console.log("[decryptMoodScore] EIP712 structure created");
        } else {
          console.warn("[decryptMoodScore] createEIP712 not available, using fallback");
          eip712 = {
            domain: {
              name: "FHEVM",
              version: "1",
              chainId: chainId || 31337,
              verifyingContract: contractAddresses[0],
            },
            types: {
              UserDecryptRequestVerification: [
                { name: "publicKey", type: "bytes" },
                { name: "contractAddresses", type: "address[]" },
                { name: "startTimestamp", type: "string" },
                { name: "durationDays", type: "string" },
              ],
            },
            message: {
              publicKey: ethers.hexlify(keypair.publicKey),
              contractAddresses,
              startTimestamp,
              durationDays,
            },
          };
        }

        console.log("[decryptMoodScore] Signing EIP712 message...");
        const signature = await ethersSigner.signTypedData(
          eip712.domain,
          { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
          eip712.message
        );
        console.log("[decryptMoodScore] Signature created");

        console.log("[decryptMoodScore] Calling userDecrypt...");
        const decryptedResult = await (fhevmInstance as any).userDecrypt(
          handleContractPairs,
          keypair.privateKey,
          keypair.publicKey,
          signature,
          contractAddresses,
          address as `0x${string}`,
          startTimestamp,
          durationDays
        );

        console.log("[decryptMoodScore] Decryption result:", decryptedResult);

        const decryptedTotal = Number(decryptedResult[totalHandle] || 0);
        const decryptedCount = Number(decryptedResult[countHandle] || 0);
        const averageScore = decryptedCount === 0 ? 0 : decryptedTotal / decryptedCount;

        console.log("[decryptMoodScore] Decrypted values:", {
          total: decryptedTotal,
          count: decryptedCount,
          average: averageScore,
        });

        setMessage("Decryption successful");
        return { totalScore: decryptedTotal, answerCount: decryptedCount, averageScore };
      } catch (error: any) {
        console.error("[decryptMoodScore] Error decrypting mood score:", error);
        const errorMessage = error.reason || error.message || String(error);
        setMessage(`Error decrypting: ${errorMessage}`);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [contractAddress, ethersProvider, fhevmInstance, ethersSigner, address, chainId]
  );

  const loadSubmissionStatus = useCallback(async () => {
    if (!contractAddress || !ethersProvider || !address) {
      return;
    }

    try {
      const contract = new ethers.Contract(contractAddress, MoodScoreTestABI, ethersProvider);
      const submitted = await contract.hasSubmitted(address);
      setHasSubmitted(submitted);
    } catch (error: any) {
      console.error("Error loading submission status:", error);
    }
  }, [contractAddress, ethersProvider, address]);

  useEffect(() => {
    if (contractAddress && ethersProvider && address) {
      loadSubmissionStatus();
    }
  }, [contractAddress, ethersProvider, address, loadSubmissionStatus]);

  return {
    contractAddress,
    hasSubmitted,
    isLoading,
    message,
    submitMoodTest,
    decryptMoodScore,
    loadSubmissionStatus,
  };
}


import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { MoodScoreTest } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("MoodScoreTestSepolia", function () {
  let signers: Signers;
  let moodScoreTestContract: MoodScoreTest;
  let moodScoreTestContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const MoodScoreTestDeployment = await deployments.get("MoodScoreTest");
      moodScoreTestContractAddress = MoodScoreTestDeployment.address;
      moodScoreTestContract = await ethers.getContractAt("MoodScoreTest", MoodScoreTestDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should submit mood test with encrypted scores on Sepolia", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    const totalScore = 18;
    const answerCount = 5;

    progress("Encrypting total score...");
    const encryptedTotalScore = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(totalScore)
      .encrypt();

    progress("Encrypting answer count...");
    const encryptedAnswerCount = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(answerCount)
      .encrypt();

    progress(
      `Call submitMoodTest() MoodScoreTest=${moodScoreTestContractAddress} signer=${signers.alice.address}...`
    );
    const tx = await moodScoreTestContract
      .connect(signers.alice)
      .submitMoodTest(
        encryptedTotalScore.handles[0],
        encryptedAnswerCount.handles[0],
        encryptedTotalScore.inputProof,
        { gasLimit: 5000000 }
      );
    await tx.wait();

    progress("Checking submission status...");
    const hasSubmitted = await moodScoreTestContract.hasSubmitted(signers.alice.address);
    expect(hasSubmitted).to.be.true;

    progress("Getting encrypted total score...");
    const encryptedTotal = await moodScoreTestContract.getEncryptedTotalScore(signers.alice.address);
    expect(encryptedTotal).to.not.eq(ethers.ZeroHash);

    progress("Getting encrypted answer count...");
    const encryptedCount = await moodScoreTestContract.getEncryptedAnswerCount(signers.alice.address);
    expect(encryptedCount).to.not.eq(ethers.ZeroHash);

    progress("Decrypting total score...");
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      moodScoreTestContractAddress,
      signers.alice
    );
    progress(`Decrypted total score: ${decryptedTotal}`);

    progress("Decrypting answer count...");
    const decryptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      moodScoreTestContractAddress,
      signers.alice
    );
    progress(`Decrypted answer count: ${decryptedCount}`);

    expect(decryptedTotal).to.eq(totalScore);
    expect(decryptedCount).to.eq(answerCount);
  });
});


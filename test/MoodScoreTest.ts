import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { MoodScoreTest, MoodScoreTest__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("MoodScoreTest")) as MoodScoreTest__factory;
  const moodScoreTestContract = (await factory.deploy()) as MoodScoreTest;
  const moodScoreTestContractAddress = await moodScoreTestContract.getAddress();

  return { moodScoreTestContract, moodScoreTestContractAddress };
}

describe("MoodScoreTest", function () {
  let signers: Signers;
  let moodScoreTestContract: MoodScoreTest;
  let moodScoreTestContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ moodScoreTestContract, moodScoreTestContractAddress } = await deployFixture());
  });

  it("should not have submitted test initially", async function () {
    const hasSubmitted = await moodScoreTestContract.hasSubmitted(signers.alice.address);
    expect(hasSubmitted).to.be.false;
  });

  it("should submit mood test with encrypted scores", async function () {
    // Simulate 5 questions with answers: [3, 4, 2, 5, 3] = total 17
    const totalScore = 17;
    const answerCount = 5;

    // Encrypt total score
    const encryptedTotalScore = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(totalScore)
      .encrypt();

    // Encrypt answer count
    const encryptedAnswerCount = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(answerCount)
      .encrypt();

    // Submit mood test
    const tx = await moodScoreTestContract
      .connect(signers.alice)
      .submitMoodTest(
        encryptedTotalScore.handles[0],
        encryptedAnswerCount.handles[0],
        encryptedTotalScore.inputProof
      );
    await tx.wait();

    // Verify submission
    const hasSubmitted = await moodScoreTestContract.hasSubmitted(signers.alice.address);
    expect(hasSubmitted).to.be.true;

    // Get encrypted values
    const encryptedTotal = await moodScoreTestContract.getEncryptedTotalScore(signers.alice.address);
    const encryptedCount = await moodScoreTestContract.getEncryptedAnswerCount(signers.alice.address);

    // Decrypt and verify
    const decryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotal,
      moodScoreTestContractAddress,
      signers.alice
    );

    const decryptedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCount,
      moodScoreTestContractAddress,
      signers.alice
    );

    expect(decryptedTotal).to.eq(totalScore);
    expect(decryptedCount).to.eq(answerCount);
  });

  it("should prevent duplicate submissions", async function () {
    const totalScore = 15;
    const answerCount = 5;

    const encryptedTotalScore = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(totalScore)
      .encrypt();

    const encryptedAnswerCount = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(answerCount)
      .encrypt();

    // First submission
    const tx1 = await moodScoreTestContract
      .connect(signers.alice)
      .submitMoodTest(
        encryptedTotalScore.handles[0],
        encryptedAnswerCount.handles[0],
        encryptedTotalScore.inputProof
      );
    await tx1.wait();

    // Try second submission - should fail
    await expect(
      moodScoreTestContract
        .connect(signers.alice)
        .submitMoodTest(
          encryptedTotalScore.handles[0],
          encryptedAnswerCount.handles[0],
          encryptedTotalScore.inputProof
        )
    ).to.be.revertedWith("Already submitted mood test");
  });

  it("should allow different users to submit", async function () {
    const aliceTotal = 20;
    const aliceCount = 5;
    const bobTotal = 15;
    const bobCount = 5;

    // Alice submits
    const aliceEncryptedTotal = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(aliceTotal)
      .encrypt();
    const aliceEncryptedCount = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.alice.address)
      .add32(aliceCount)
      .encrypt();

    const tx1 = await moodScoreTestContract
      .connect(signers.alice)
      .submitMoodTest(
        aliceEncryptedTotal.handles[0],
        aliceEncryptedCount.handles[0],
        aliceEncryptedTotal.inputProof
      );
    await tx1.wait();

    // Bob submits
    const bobEncryptedTotal = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.bob.address)
      .add32(bobTotal)
      .encrypt();
    const bobEncryptedCount = await fhevm
      .createEncryptedInput(moodScoreTestContractAddress, signers.bob.address)
      .add32(bobCount)
      .encrypt();

    const tx2 = await moodScoreTestContract
      .connect(signers.bob)
      .submitMoodTest(
        bobEncryptedTotal.handles[0],
        bobEncryptedCount.handles[0],
        bobEncryptedTotal.inputProof
      );
    await tx2.wait();

    // Verify both submissions
    expect(await moodScoreTestContract.hasSubmitted(signers.alice.address)).to.be.true;
    expect(await moodScoreTestContract.hasSubmitted(signers.bob.address)).to.be.true;

    // Decrypt and verify Alice's score
    const aliceEncryptedTotalResult = await moodScoreTestContract.getEncryptedTotalScore(signers.alice.address);
    const aliceDecryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      aliceEncryptedTotalResult,
      moodScoreTestContractAddress,
      signers.alice
    );
    expect(aliceDecryptedTotal).to.eq(aliceTotal);

    // Decrypt and verify Bob's score
    const bobEncryptedTotalResult = await moodScoreTestContract.getEncryptedTotalScore(signers.bob.address);
    const bobDecryptedTotal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      bobEncryptedTotalResult,
      moodScoreTestContractAddress,
      signers.bob
    );
    expect(bobDecryptedTotal).to.eq(bobTotal);
  });
});


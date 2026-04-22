import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("LiquiPool protocol flow", function () {
  async function deployFixture() {
    const [owner, poolManager, alice, bob, outsider] = await ethers.getSigners();

    const token = await ethers.deployContract("MockUSDT");
    await token.waitForDeployment();

    const monthlyContribution = ethers.parseUnits("100", 6);
    const securityDeposit = ethers.parseUnits("200", 6);
    const gracePenalty = ethers.parseUnits("5", 6);
    const primaryWindow = 3 * 24 * 60 * 60;
    const graceWindow = 2 * 24 * 60 * 60;

    const handler = await ethers.deployContract("LiquiPoolHandler", [
      poolManager.address,
      2,
      2,
      true,
      monthlyContribution,
      securityDeposit,
      gracePenalty,
      primaryWindow,
      graceWindow,
    ]);
    await handler.waitForDeployment();

    const vault = await ethers.deployContract("LiquiPoolVault", [
      await handler.getAddress(),
      await token.getAddress(),
    ]);
    await vault.waitForDeployment();

    await handler.updateVaultContractAddress(await vault.getAddress());

    await token.transferMockTokens(poolManager.address, 2_000);
    await token.transferMockTokens(alice.address, 2_000);
    await token.transferMockTokens(bob.address, 2_000);

    for (const signer of [poolManager, alice, bob]) {
      await token.connect(signer).approve(await vault.getAddress(), ethers.MaxUint256);
    }

    await handler.connect(alice).requestEnrollment();
    await handler.connect(bob).requestEnrollment();
    await handler.connect(poolManager).approveMemberEnrollment(alice.address);
    await handler.connect(poolManager).approveMemberEnrollment(bob.address);

    await vault.connect(poolManager).lockSecurityDeposit();
    await handler.connect(poolManager).changePoolState(1);

    return {
      owner,
      poolManager,
      alice,
      bob,
      outsider,
      token,
      handler,
      vault,
      monthlyContribution,
      securityDeposit,
      gracePenalty,
      primaryWindow,
      graceWindow,
    };
  }

  async function increaseTime(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  it("enforces enrollment requests, fixed membership, and activation prerequisites", async function () {
    const { poolManager, alice, bob, outsider, token, handler, vault } = await deployFixture();

    const freshHandler = await ethers.deployContract("LiquiPoolHandler", [
      poolManager.address,
      2,
      2,
      true,
      ethers.parseUnits("100", 6),
      ethers.parseUnits("200", 6),
      ethers.parseUnits("5", 6),
      100,
      100,
    ]);
    await freshHandler.waitForDeployment();

    const freshVault = await ethers.deployContract("LiquiPoolVault", [
      await freshHandler.getAddress(),
      await token.getAddress(),
    ]);
    await freshVault.waitForDeployment();

    await freshHandler.updateVaultContractAddress(await freshVault.getAddress());

    await expect(
      freshHandler.connect(poolManager).approveMemberEnrollment(alice.address)
    ).to.be.revertedWithCustomError(freshHandler, "LiquiPool__MemberNotRequested");

    await freshHandler.connect(alice).requestEnrollment();
    await freshHandler.connect(bob).requestEnrollment();
    await freshHandler.connect(poolManager).approveMemberEnrollment(alice.address);
    await freshHandler.connect(poolManager).approveMemberEnrollment(bob.address);

    await freshHandler.connect(outsider).requestEnrollment();

    await expect(
      freshHandler.connect(poolManager).approveMemberEnrollment(outsider.address)
    ).to.be.revertedWithCustomError(freshHandler, "LiquiPool__EnrollmentCapacityReached");

    await expect(
      freshHandler.connect(poolManager).changePoolState(1)
    ).to.be.revertedWithCustomError(freshHandler, "LiquiPool__SecurityDepositNotLocked");

    await token.transferMockTokens(poolManager.address, 1_000);
    await token.connect(poolManager).approve(await freshVault.getAddress(), ethers.MaxUint256);
    await freshVault.connect(poolManager).lockSecurityDeposit();
    await freshHandler.connect(poolManager).changePoolState(1);

    expect(await freshHandler.getPoolState()).to.equal(1n);

    await expect(
      freshHandler.connect(outsider).decreaseScore(alice.address, 10)
    ).to.be.revertedWithCustomError(freshHandler, "LiquiPool__OnlyVaultContract");

    expect(await handler.getEnrolledMemberCount()).to.equal(2n);
    expect(await vault.getCurrentRound()).to.equal(0n);
  });

  it("settles a bidding round, covers defaults from the security deposit, and tracks winners", async function () {
    const {
      poolManager,
      alice,
      bob,
      token,
      handler,
      vault,
      monthlyContribution,
      securityDeposit,
      primaryWindow,
      graceWindow,
    } = await deployFixture();

    const aliceBefore = await token.balanceOf(alice.address);
    const bobBefore = await token.balanceOf(bob.address);

    await vault.connect(poolManager).startNextRound();
    expect(await vault.getCurrentRound()).to.equal(1n);

    await vault.connect(alice).contributeMonthly();

    await increaseTime(primaryWindow + graceWindow + 1);

    await vault.connect(poolManager).openBiddingRound();
    await vault.connect(alice).submitBid(ethers.parseUnits("20", 6));
    await vault.connect(poolManager).closeBiddingRound();
    await vault.connect(poolManager).settleCurrentRound();

    const aliceAfter = await token.balanceOf(alice.address);
    const bobAfter = await token.balanceOf(bob.address);

    expect(await vault.hasMemberReceivedPayout(alice.address)).to.equal(true);
    expect(await vault.getRoundWinners()).to.deep.equal([alice.address]);
    expect(await handler.getSecurityDepositBalance()).to.equal(securityDeposit - monthlyContribution);
    expect(await handler.getMemberScore(bob.address)).to.equal(5n);

    expect(aliceAfter - aliceBefore).to.equal(ethers.parseUnits("80", 6));
    expect(bobAfter - bobBefore).to.equal(ethers.parseUnits("20", 6));
  });

  it("supports a non-bidding round, finalizes the cycle, and releases the remaining deposit", async function () {
    const {
      poolManager,
      alice,
      bob,
      token,
      handler,
      vault,
      primaryWindow,
      graceWindow,
      monthlyContribution,
    } = await deployFixture();

    await vault.connect(poolManager).startNextRound();
    await vault.connect(alice).contributeMonthly();
    await increaseTime(primaryWindow + graceWindow + 1);
    await vault.connect(poolManager).openBiddingRound();
    await vault.connect(alice).submitBid(ethers.parseUnits("20", 6));
    await vault.connect(poolManager).closeBiddingRound();
    await vault.connect(poolManager).settleCurrentRound();

    await vault.connect(poolManager).startNextRound();
    await vault.connect(alice).contributeMonthly();
    await vault.connect(bob).contributeMonthly();
    await increaseTime(primaryWindow + graceWindow + 1);
    await vault.connect(poolManager).settleCurrentRound();
    await vault.connect(poolManager).finalizePoolCycle();

    const managerBalanceBeforeRelease = await token.balanceOf(poolManager.address);
    await vault.connect(poolManager).releaseSecurityDeposit();
    const managerBalanceAfterRelease = await token.balanceOf(poolManager.address);

    expect(await handler.getPoolState()).to.equal(3n);
    expect(await vault.getCurrentRound()).to.equal(2n);

    const winners = await vault.getRoundWinners();
    expect(winners[0]).to.equal(alice.address);
    expect(winners[1]).to.equal(bob.address);
    expect(await handler.getSecurityDepositBalance()).to.equal(0);
    expect(managerBalanceAfterRelease - managerBalanceBeforeRelease).to.equal(monthlyContribution);
  });
});

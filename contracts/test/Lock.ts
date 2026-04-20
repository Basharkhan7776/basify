import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Lock", function () {
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000n;

    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: ONE_GWEI,
    });

    return { lock, unlockTime, ONE_GWEI };
  }

  it("should set the right unlockTime", async function () {
    const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("should set the right owner", async function () {
    const { lock, owner } = await loadFixture(deployOneYearLockFixture);

    expect(await lock.owner()).to.equal(owner);
  });

  it("should receive and store the funds", async function () {
    const { lock, ONE_GWEI } = await loadFixture(deployOneYearLockFixture);

    expect(await hre.ethers.provider.getBalance(lock.address)).to.equal(
      ONE_GWEI
    );
  });

  it("should fail if the unlockTime has not been reached", async function () {
    const { lock } = await loadFixture(deployOneYearLockFixture);

    await expect(lock.withdraw()).to.be.revertedWith("Not yet unlocked");
  });

  it("should fail if called by another account than the owner", async function () {
    const { lock, owner } = await loadFixture(deployOneYearLockFixture);

    const [_, notOwner] = await hre.ethers.getSigners();
    const lockAsNotOwner = lock.connect(notOwner);

    await expect(lockAsNotOwner.withdraw()).to.be.revertedWith("Not owner");
  });

  it("should transfer the funds to the owner", async function () {
    const { lock, owner, ONE_GWEI } = await loadFixture(deployOneYearLockFixture);

    const lockAsOwner = lock.connect(owner);

    const balanceBefore = await hre.ethers.provider.getBalance(owner);

    const tx = await lockAsOwner.withdraw();
    const receipt = await tx.wait();

    const balanceAfter = await hre.ethers.provider.getBalance(owner);

    expect(await hre.ethers.provider.getBalance(lock.address)).to.equal(0);
    expect(balanceAfter).to.equal(balanceBefore + ONE_GWEI);
  });
});

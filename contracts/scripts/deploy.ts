import hre from "hardhat";

async function main() {
  const [deployer, poolManager] = await hre.ethers.getSigners();

  const token = await hre.ethers.deployContract("MockUSDT");
  await token.waitForDeployment();

  const memberLimit = 5n;
  const totalRounds = 5n;
  const monthlyContribution = hre.ethers.parseUnits("100", 6);
  const securityDeposit = hre.ethers.parseUnits("500", 6);
  const gracePenalty = hre.ethers.parseUnits("5", 6);
  const primaryWindow = 3n * 24n * 60n * 60n;
  const graceWindow = 2n * 24n * 60n * 60n;

  const handler = await hre.ethers.deployContract("LiquiPoolHandler", [
    poolManager.address,
    memberLimit,
    totalRounds,
    true,
    monthlyContribution,
    securityDeposit,
    gracePenalty,
    primaryWindow,
    graceWindow,
  ]);
  await handler.waitForDeployment();

  const vault = await hre.ethers.deployContract("LiquiPoolVault", [
    await handler.getAddress(),
    await token.getAddress(),
  ]);
  await vault.waitForDeployment();

  await handler.updateVaultContractAddress(await vault.getAddress());

  console.log("LiquiPool stack deployed");
  console.log(`deployer: ${deployer.address}`);
  console.log(`poolManager: ${poolManager.address}`);
  console.log(`mockUSDT: ${await token.getAddress()}`);
  console.log(`handler: ${await handler.getAddress()}`);
  console.log(`vault: ${await vault.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

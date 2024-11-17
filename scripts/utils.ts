import fs from "fs";
import { ethers } from "hardhat";
import { TestERC20, TradeEntry } from "../typechain-types";

async function getDeployments() {
  const { chainId } = await ethers.provider.getNetwork();
  const deployedAddressesPath = `ignition/deployments/chain-${chainId}/deployed_addresses.json`;
  return JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
}

export async function getTradeEntry(): Promise<TradeEntry> {
  const deployments = await getDeployments();
  const tradeEntryAddress = deployments["TradeEntry#TradeEntry"];
  return await ethers.getContractAt("TradeEntry", tradeEntryAddress);
}

export async function getTestERC20(): Promise<TestERC20> {
  const deployments = await getDeployments();
  const testERC20Address = deployments["TradeEntry#USDC"];
  return await ethers.getContractAt("TestERC20", testERC20Address);
}

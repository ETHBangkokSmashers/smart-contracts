import { ethers, network } from "hardhat";
import fs from "fs";
import { TradeEntry } from "../typechain-types";
import { Config } from "./configs";
import {
  BTC_ASSET_ID,
  CHAINLINK_DATA_SOURCE_ID,
  ETH_ASSET_ID,
} from "../test/utils";

async function getTradeEntry(): Promise<TradeEntry> {
  const { chainId } = await ethers.provider.getNetwork();

  const deployedAddressesPath = `ignition/deployments/chain-${chainId}/deployed_addresses.json`;
  const addresses = JSON.parse(fs.readFileSync(deployedAddressesPath, "utf8"));
  const tradeEntryAddress = addresses["TradeEntry#TradeEntry"];

  return await ethers.getContractAt("TradeEntry", tradeEntryAddress);
}

async function main() {
  const tradeEntry = await getTradeEntry();
  const networkConfig = Config[network.name!];

  if (networkConfig.chainlink.enabled) {
    console.log("Configuring Chainlink");

    console.log("Add BTC");

    let tx = await tradeEntry.setAssetDataSourceAllowed(
      BTC_ASSET_ID,
      CHAINLINK_DATA_SOURCE_ID,
      true,
    );
    console.log("TX 1:", tx.hash);
    await tx.wait();

    tx = await tradeEntry.setChainlinkAssetPriceFeed(
      BTC_ASSET_ID,
      networkConfig.chainlink.btcFeed!,
    );
    console.log("TX 2:", tx.hash);
    await tx.wait();

    console.log("Add ETH");

    tx = await tradeEntry.setAssetDataSourceAllowed(
      ETH_ASSET_ID,
      CHAINLINK_DATA_SOURCE_ID,
      true,
    );
    console.log("TX 3:", tx.hash);
    await tx.wait();

    tx = await tradeEntry.setChainlinkAssetPriceFeed(
      ETH_ASSET_ID,
      networkConfig.chainlink.ethFeed!,
    );
    console.log("TX 4:", tx.hash);
    await tx.wait();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

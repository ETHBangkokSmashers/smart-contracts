import { ethers, network } from "hardhat";
import fs from "fs";
import { TradeEntry } from "../typechain-types";
import { Config } from "./configs";
import {
  BTC_ASSET_ID,
  BTC_PRICE_FEED_ID,
  CHAINLINK_DATA_SOURCE_ID,
  ETH_ASSET_ID,
  ETH_PRICE_FEED_ID,
  PYTH_DATA_SOURCE_ID,
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

  if (networkConfig.pyth.enabled) {
    console.log("Configuring Pyth");

    // Set Pyth
    let tx = await tradeEntry.setPyth(networkConfig.pyth.address!);
    console.log("TX 1:", tx.hash);
    await tx.wait();

    // Set Price Feeds
    tx = await tradeEntry.configurePythFeeds(
      [BTC_ASSET_ID, ETH_ASSET_ID],
      [BTC_PRICE_FEED_ID, ETH_PRICE_FEED_ID],
    );
    console.log("TX 2:", tx.hash);
    await tx.wait();

    // Set Data Source Allowed
    tx = await tradeEntry.setAssetsDataSourceAllowed(
      [BTC_ASSET_ID, ETH_ASSET_ID],
      PYTH_DATA_SOURCE_ID,
      true,
    );
    console.log("TX 3:", tx.hash);
    await tx.wait();
  }

  if (networkConfig.chainlink.enabled) {
    console.log("Configuring Chainlink");

    // Set Feeds
    let tx = await tradeEntry.configureChainlinkFeeds(
      [BTC_ASSET_ID, ETH_ASSET_ID],
      [networkConfig.chainlink.btcFeed!, networkConfig.chainlink.ethFeed!],
    );
    console.log("TX 1:", tx.hash);
    await tx.wait();

    // Set Data Source Allowed
    tx = await tradeEntry.setAssetsDataSourceAllowed(
      [BTC_ASSET_ID, ETH_ASSET_ID],
      CHAINLINK_DATA_SOURCE_ID,
      true,
    );
    console.log("TX 2:", tx.hash);
    await tx.wait();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

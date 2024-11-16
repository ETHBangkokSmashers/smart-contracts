import { ethers } from "hardhat";

import {
  BTC_ASSET_ID,
  CHAINLINK_DATA_SOURCE_ID,
  signTrade,
  TradeDirection,
} from "../test/utils";
import { getTestERC20, getTradeEntry } from "./utils";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // Get accounts
  const [initiator, acceptor] = await ethers.getSigners();

  const tradeEntry = await getTradeEntry();
  const usdc = await getTestERC20();

  // Mint tokens
  console.log("Mint to initiator");
  let tx = await usdc.mint(initiator.address, ethers.parseUnits("10000"));
  await tx.wait();
  console.log("Mint to acceptor");
  tx = await usdc.mint(acceptor.address, ethers.parseUnits("10000"));
  await tx.wait();

  // Approve
  console.log("Initiator approves");
  tx = await usdc.approve(tradeEntry, ethers.parseUnits("10000"));
  await tx.wait();
  console.log("Acceptor approves");
  tx = await usdc
    .connect(acceptor)
    .approve(tradeEntry, ethers.parseUnits("10000"));
  await tx.wait();

  // Initiate trade
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  const tradeParams = {
    depositAsset: await usdc.getAddress(),
    initiator: initiator.address,
    initiatorAmount: ethers.parseUnits("100").toString(),
    acceptor: ethers.ZeroAddress,
    acceptorAmount: ethers.parseUnits("100").toString(),
    acceptionDeadline: block!.timestamp + 100,
    expiry: block!.timestamp + 20,
    observationAssetId: BTC_ASSET_ID,
    direction: TradeDirection.Above,
    price: ethers.parseUnits("100000"),
    dataSourceId: CHAINLINK_DATA_SOURCE_ID,
    nonce: 1,
  };
  console.log(tradeParams);

  const sig = await signTrade(initiator, tradeEntry, tradeParams);
  console.log(sig);

  // Accept trade
  console.log("Accepting trade");
  tx = await tradeEntry.connect(acceptor).startTrade(tradeParams, sig);
  console.log(tx.hash);
  await tx.wait();

  // Wait
  await sleep(20 * 1000);

  // Settle trade
  console.log("Looking for Chainlink roundId");
  const feedAddress = await tradeEntry.chainlinkAssetPriceFeeds(
    tradeParams.observationAssetId,
  );
  const feed = await ethers.getContractAt("AggregatorV3Interface", feedAddress);
  let [roundId, , , timestamp] = await feed.latestRoundData();
  while (timestamp > tradeParams.expiry) {
    roundId--;
    [, , , timestamp] = await feed.getRoundData(roundId);
  }
  console.log("Using round id:", roundId);

  const extraData = ethers.zeroPadValue(ethers.toBeHex(roundId), 32);
  tx = await tradeEntry.settleTrade(tradeParams, extraData);
  console.log("TX:", tx.hash);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

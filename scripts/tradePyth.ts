import { ethers } from "hardhat";
import axios from "axios";

import {
  BTC_ASSET_ID,
  PYTH_DATA_SOURCE_ID,
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
    dataSourceId: PYTH_DATA_SOURCE_ID,
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
  const priceFeedId = await tradeEntry.pythAssetFeedIds(
    tradeParams.observationAssetId,
  );
  const HERMES_API_BASE_ENDPOINT = "https://hermes.pyth.network/v2";
  const url = `${HERMES_API_BASE_ENDPOINT}/updates/price/${tradeParams.expiry}?ids%5B%5D=${priceFeedId}`;
  const result = await axios.get(url);
  console.log("Price:", result.data.parsed[0].price.price);
  console.log("Update:", result.data.binary.data[0]);

  const extraData = "0x" + result.data.binary.data[0];

  const pythAddress = await tradeEntry.pyth();
  const pyth = await ethers.getContractAt("IPyth", pythAddress);
  const updateFee = await pyth.getUpdateFee([extraData]);
  console.log("Update fee:", updateFee);

  tx = await tradeEntry.settleTrade(tradeParams, extraData, {
    value: updateFee,
  });
  console.log("TX:", tx.hash);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

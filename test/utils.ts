import hre from "hardhat";
import ethers from "ethers";

import {
  TradeEntry,
  TradeParamsStruct,
} from "../typechain-types/contracts/TradeEntry";

// Constants

export const BTC_ASSET_ID = 1;
export const ETH_ASSET_ID = 2;

export const CHAINLINK_DATA_SOURCE_ID = 1;
export const PYTH_DATA_SOURCE_ID = 2;

export enum TradeDirection {
  Above,
  Below,
}

export enum TradeStatus {
  None,
  Cancelled,
  Started,
  Settling,
  Settled,
}

export const BTC_PRICE_FEED_ID =
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";
export const ETH_PRICE_FEED_ID =
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

// Signature

export const DomainTradeEntry = async (tradeEntry: TradeEntry) => {
  const { chainId } = await hre.ethers.provider.getNetwork();
  return {
    name: "TradeEntry",
    version: "1",
    chainId: chainId,
    verifyingContract: await tradeEntry.getAddress(),
  };
};

export const TypesTradeParams = {
  TradeParams: [
    { name: "depositAsset", type: "address" },
    { name: "initiator", type: "address" },
    { name: "initiatorAmount", type: "uint256" },
    { name: "acceptor", type: "address" },
    { name: "acceptorAmount", type: "uint256" },
    { name: "acceptionDeadline", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "observationAssetId", type: "uint32" },
    { name: "direction", type: "uint8" },
    { name: "price", type: "uint256" },
    { name: "dataSourceId", type: "uint8" },
    { name: "nonce", type: "uint256" },
  ],
};

export async function signTrade(
  signer: ethers.Signer,
  tradeEntry: TradeEntry,
  params: TradeParamsStruct,
) {
  return await signer.signTypedData(
    await DomainTradeEntry(tradeEntry),
    TypesTradeParams,
    params,
  );
}

export async function hashTrade(
  tradeEntry: TradeEntry,
  params: TradeParamsStruct,
) {
  return hre.ethers.TypedDataEncoder.hash(
    await DomainTradeEntry(tradeEntry),
    TypesTradeParams,
    params,
  );
}

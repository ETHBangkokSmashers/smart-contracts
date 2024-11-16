import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { TradeEntry, TestERC20, TestPyth } from "../typechain-types";
import {
  BTC_ASSET_ID,
  BTC_PRICE_FEED_ID,
  CHAINLINK_DATA_SOURCE_ID,
  ETH_ASSET_ID,
  hashTrade,
  PYTH_DATA_SOURCE_ID,
  signTrade,
  TradeDirection,
  TradeStatus,
} from "./utils";
import { TradeParamsStruct } from "../typechain-types/contracts/TradeEntry";

describe("TradeEntry", function () {
  let owner: Signer, other: Signer, third: Signer;
  let tradeEntry: TradeEntry, usdc: TestERC20, pyth: TestPyth;
  let defaultTradeParams: TradeParamsStruct;

  async function deployPythFixture() {
    [owner, other, third] = await ethers.getSigners();

    const TradeEntryFactory = await ethers.getContractFactory("TradeEntry");
    const tradeEntry = await TradeEntryFactory.deploy();
    await tradeEntry.initialize();

    const TestERC20Factory = await ethers.getContractFactory("TestERC20");
    const usdc = await TestERC20Factory.deploy();
    await usdc.mint(owner, ethers.parseUnits("10000"));
    await usdc.mint(other, ethers.parseUnits("10000"));
    await usdc.approve(tradeEntry, ethers.parseUnits("10000"));
    await usdc.connect(other).approve(tradeEntry, ethers.parseUnits("10000"));

    const TestPythFactory = await ethers.getContractFactory("TestPyth");
    const pyth = await TestPythFactory.deploy();

    await tradeEntry.setAssetsDataSourceAllowed(
      [BTC_ASSET_ID],
      PYTH_DATA_SOURCE_ID,
      true,
    );
    await tradeEntry.setPyth(pyth);
    await tradeEntry.configurePythFeeds([BTC_ASSET_ID], [BTC_PRICE_FEED_ID]);

    return { tradeEntry, usdc, pyth };
  }

  this.beforeEach(async function () {
    ({ tradeEntry, usdc, pyth } = await loadFixture(deployPythFixture));

    const timestamp = await time.latest();
    defaultTradeParams = {
      depositAsset: await usdc.getAddress(),
      initiator: await owner.getAddress(),
      initiatorAmount: ethers.parseUnits("100"),
      acceptor: ethers.ZeroAddress,
      acceptorAmount: ethers.parseUnits("100"),
      acceptionDeadline: timestamp + 100,
      expiry: timestamp + 24 * 3600,
      observationAssetId: BTC_ASSET_ID,
      direction: TradeDirection.Above,
      price: ethers.parseUnits("100000"),
      dataSourceId: PYTH_DATA_SOURCE_ID,
      nonce: 1,
    };
  });

  describe("#startTrade", function () {
    it("reverts starting trade with forbidden observation asset", async function () {
      const tradeParams = {
        ...defaultTradeParams,
        observationAssetId: ETH_ASSET_ID,
      };
      const sig = await signTrade(owner, tradeEntry, tradeParams);

      await expect(
        tradeEntry.connect(other).startTrade(tradeParams, sig),
      ).to.be.revertedWithCustomError(
        tradeEntry,
        "UnavailableAssetOrDataSource",
      );
    });

    it("reverts starting trade with forbidden data source asset", async function () {
      const tradeParams = {
        ...defaultTradeParams,
        dataSourceId: CHAINLINK_DATA_SOURCE_ID,
      };
      const sig = await signTrade(owner, tradeEntry, tradeParams);

      await expect(
        tradeEntry.connect(other).startTrade(tradeParams, sig),
      ).to.be.revertedWithCustomError(
        tradeEntry,
        "UnavailableAssetOrDataSource",
      );
    });

    it("starts trade with correct data", async function () {
      const sig = await signTrade(owner, tradeEntry, defaultTradeParams);

      const tx = await tradeEntry
        .connect(other)
        .startTrade(defaultTradeParams, sig);

      const tradeHash = await hashTrade(tradeEntry, defaultTradeParams);
      await expect(tx)
        .to.emit(tradeEntry, "TradeStarted")
        .withArgs(tradeHash, anyValue);

      await expect(tx).to.changeTokenBalances(
        usdc,
        [owner, other, tradeEntry],
        [
          ethers.parseUnits("-100"),
          ethers.parseUnits("-100"),
          ethers.parseUnits("200"),
        ],
      );

      const details = await tradeEntry.tradeDetails(tradeHash);
      expect(details.status).to.equal(TradeStatus.Started);
      expect(details.acceptor).to.equal(other);
    });
  });

  describe("#settleTrade", function () {
    let tradeHash: string;

    describe("Above Direction", function () {
      this.beforeEach(async function () {
        const sig = await signTrade(owner, tradeEntry, defaultTradeParams);
        await tradeEntry.connect(other).startTrade(defaultTradeParams, sig);
        tradeHash = await hashTrade(tradeEntry, defaultTradeParams);
      });

      it("reverts settling non-existent trade", async function () {
        await expect(
          tradeEntry.settleTrade({ ...defaultTradeParams, nonce: 325 }, "0x"),
        ).to.be.revertedWithCustomError(tradeEntry, "WrongTradeStatus");
      });

      it("reverts settling if there's no extra data (update data)", async function () {
        await time.increase(24 * 3600);
        await expect(
          tradeEntry.settleTrade(defaultTradeParams, "0x"),
        ).to.be.revertedWithoutReason();
      });

      it("settles with correct data - initiator wins (if price above given)", async function () {
        await time.increase(24 * 3600);

        await pyth.setPrice(BTC_PRICE_FEED_ID, ethers.parseUnits("100001", 8));

        const tx = await tradeEntry.settleTrade(defaultTradeParams, "0x01");

        await expect(tx)
          .to.emit(tradeEntry, "TradeSettled")
          .withArgs(
            tradeHash,
            ethers.parseUnits("100001", 18),
            owner,
            ethers.parseUnits("200"),
          );

        await expect(tx).to.changeTokenBalances(
          usdc,
          [owner, other, tradeEntry],
          [ethers.parseUnits("200"), 0, ethers.parseUnits("-200")],
        );

        const details = await tradeEntry.tradeDetails(tradeHash);
        expect(details.status).to.equal(TradeStatus.Settled);
      });

      it("settles with correct data - initiator wins (if price below given)", async function () {
        await time.increase(24 * 3600);

        await pyth.setPrice(BTC_PRICE_FEED_ID, ethers.parseUnits("99999", 8));

        const tx = await tradeEntry.settleTrade(defaultTradeParams, "0x01");

        await expect(tx)
          .to.emit(tradeEntry, "TradeSettled")
          .withArgs(
            tradeHash,
            ethers.parseUnits("99999", 18),
            other,
            ethers.parseUnits("200"),
          );

        await expect(tx).to.changeTokenBalances(
          usdc,
          [owner, other, tradeEntry],
          [0, ethers.parseUnits("200"), ethers.parseUnits("-200")],
        );

        const details = await tradeEntry.tradeDetails(tradeHash);
        expect(details.status).to.equal(TradeStatus.Settled);
      });
    });
  });
});

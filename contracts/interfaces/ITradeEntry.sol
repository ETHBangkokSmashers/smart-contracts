// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { IPyth } from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

import { TradeParams } from "../Structs.sol";

interface ITradeEntry {
    // EVENT

    event TradeStarted(bytes32 indexed tradeHash, TradeParams params);

    event TradeCancelled(bytes32 indexed tradeHash);

    event TradeSettled(
        bytes32 indexed tradeHash,
        uint256 settlementPrice,
        address winner,
        uint256 payoff
    );

    // CONFIGURATION FUNCTIONS

    function setAssetsDataSourceAllowed(
        uint32[] calldata assetIds,
        uint8 dataSourceId,
        bool allowed
    ) external;

    function configureChainlinkFeeds(
        uint32[] calldata assetIds,
        address[] calldata feedAddresses
    ) external;

    function setPyth(IPyth _pyth) external;

    function configurePythFeeds(
        uint32[] calldata assetIds,
        bytes32[] calldata feedIds
    ) external;

    // USER FUNCTIONS

    function startTrade(
        TradeParams calldata params,
        bytes calldata initiatorSignature
    ) external returns (bytes32 tradeHash);

    function cancelTrade(TradeParams calldata params) external;

    function settleTrade(
        TradeParams calldata params,
        bytes calldata extraData
    ) external payable returns (address winner, uint256 payoff);
}

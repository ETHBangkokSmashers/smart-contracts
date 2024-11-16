// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {TradeParams} from "../Structs.sol";

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

    // FUNCTIONS

    function startTrade(
        TradeParams calldata params,
        bytes calldata initiatorSignature
    ) external returns (bytes32 tradeHash);

    function cancelTrade(TradeParams calldata params) external;

    function settleTrade(
        TradeParams calldata params,
        bytes calldata extraData
    ) external returns (address winner, uint256 payoff);
}

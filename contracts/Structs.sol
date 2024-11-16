// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

uint8 constant CHAINLINK_DATA_SOURCE_ID = 1;
uint8 constant PYTH_DATA_SOURCE_ID = 2;

enum BasicTradeDirection {
    Above,
    Below
}

struct TradeParams {
    address depositAsset;
    address initiator;
    uint256 initiatorAmount;
    address acceptor;
    uint256 acceptorAmount;
    uint256 acceptionDeadline;
    uint256 expiry;
    uint32 observationAssetId;
    BasicTradeDirection direction;
    uint256 price;
    uint8 dataSourceId;
    uint256 nonce;
}

enum TradeStatus {
    None,
    Cancelled,
    Started,
    Settling,
    Settled
}

struct TradeDetails {
    TradeStatus status;
    address acceptor;
}

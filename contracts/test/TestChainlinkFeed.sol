// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract TestChainlinkFeed {
    int256[] private prices;

    uint256[] private timestamps;

    function addRound(int256 price, uint256 timestamp) external {
        prices.push(price);
        timestamps.push(timestamp);
    }

    function getRoundData(
        uint80 _roundId
    )
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        if (_roundId < prices.length) {
            return (
                _roundId,
                prices[_roundId],
                timestamps[_roundId],
                timestamps[_roundId],
                _roundId
            );
        } else {
            return (0, 0, 0, 0, 0);
        }
    }
}

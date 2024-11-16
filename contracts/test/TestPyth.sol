// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { PythStructs } from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract TestPyth {
    mapping(bytes32 => int64) public prices;

    function setPrice(bytes32 priceId, int64 price) external {
        prices[priceId] = price;
    }

    function parsePriceFeedUpdates(
        bytes[] calldata updateDatas,
        bytes32[] calldata priceIds,
        uint64 minPublishTime,
        uint64
    ) external payable returns (PythStructs.PriceFeed[] memory priceFeeds) {
        require(updateDatas[0].length > 0);

        priceFeeds = new PythStructs.PriceFeed[](1);
        priceFeeds[0] = PythStructs.PriceFeed({
            id: priceIds[0],
            price: PythStructs.Price({
                price: prices[priceIds[0]],
                conf: 0,
                expo: -8,
                publishTime: minPublishTime
            }),
            emaPrice: PythStructs.Price({
                price: prices[priceIds[0]],
                conf: 0,
                expo: -8,
                publishTime: minPublishTime
            })
        });
    }
}

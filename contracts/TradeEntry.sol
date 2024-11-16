// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {
    IERC20,
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import {
    AggregatorV3Interface
} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import { IPyth, PythStructs } from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";

import {
    TradeParams,
    TradeDetails,
    TradeStatus,
    BasicTradeDirection,
    CHAINLINK_DATA_SOURCE_ID,
    PYTH_DATA_SOURCE_ID
} from "./Structs.sol";
import { ITradeEntry } from "./interfaces/ITradeEntry.sol";
import {
    InvalidSignature,
    UnavailableAssetOrDataSource,
    NotTradeAcceptor,
    AcceptionDeadlinePassed,
    WrongTradeStatus,
    NotTradeInitiator,
    TradeNotExpired,
    InvalidChainlinkRoundId,
    InvalidDataSource,
    InvalidPythResponse,
    LengthMismatch
} from "./utils/Errors.sol";

contract TradeEntry is Ownable, EIP712, ITradeEntry {
    using SafeERC20 for IERC20;
    using SafeCast for int256;
    using SafeCast for uint256;

    // CONSTANTS

    /// @notice EIP712 typehash used for trades
    bytes32 public constant TRADE_TYPEHASH =
        keccak256(
            "TradeParams(address depositAsset,address initiator,uint256 initiatorAmount,address acceptor,uint256 acceptorAmount,uint256 acceptionDeadline,uint256 expiry,uint32 observationAssetId,uint8 direction,uint256 price,uint8 dataSourceId,uint256 nonce)"
        );

    uint32 constant CHAILINK_DECIMALS = 8;

    uint32 constant TARGET_DECIMALS = 18;

    // STORAGE

    // Trade configuration

    mapping(bytes32 => TradeDetails) public tradeDetails;

    mapping(uint32 => mapping(uint8 => bool)) public assetDataSourceAllowed;

    // Data source configuration

    mapping(uint32 => address) public chainlinkAssetPriceFeeds;

    IPyth public pyth;

    mapping(uint32 => bytes32) public pythAssetFeedIds;

    // CONSTRUCTOR

    constructor() EIP712("TradeEntry", "1") Ownable(msg.sender) {}

    // CONFIGURATION FUNCTIONS

    function setAssetsDataSourceAllowed(
        uint32[] calldata assetIds,
        uint8 dataSourceId,
        bool allowed
    ) external onlyOwner {
        for (uint256 i = 0; i < assetIds.length; i++) {
            assetDataSourceAllowed[assetIds[i]][dataSourceId] = allowed;
        }
    }

    function configureChainlinkFeeds(
        uint32[] calldata assetIds,
        address[] calldata feedAddresses
    ) external onlyOwner {
        require(assetIds.length == feedAddresses.length, LengthMismatch());
        for (uint256 i = 0; i < assetIds.length; i++) {
            chainlinkAssetPriceFeeds[assetIds[i]] = feedAddresses[i];
        }
    }

    function setPyth(IPyth _pyth) external onlyOwner {
        pyth = _pyth;
    }

    function configurePythFeeds(
        uint32[] calldata assetIds,
        bytes32[] calldata feedIds
    ) external onlyOwner {
        require(assetIds.length == feedIds.length, LengthMismatch());
        for (uint256 i = 0; i < assetIds.length; i++) {
            pythAssetFeedIds[assetIds[i]] = feedIds[i];
        }
    }

    // MUTATIVE FUNCTIONS

    function startTrade(
        TradeParams calldata params,
        bytes calldata initiatorSignature
    ) external returns (bytes32 tradeHash) {
        // Check signature
        tradeHash = _hashTypedDataV4(_hashTradeParams(params));
        address signer = ECDSA.recover(tradeHash, initiatorSignature);
        require(signer == params.initiator, InvalidSignature());

        // Check trade params
        require(
            assetDataSourceAllowed[params.observationAssetId][
                params.dataSourceId
            ],
            UnavailableAssetOrDataSource()
        );
        require(
            params.acceptor == address(0) || params.acceptor == msg.sender,
            NotTradeAcceptor()
        );
        require(
            block.timestamp <= params.acceptionDeadline,
            AcceptionDeadlinePassed()
        );
        require(
            tradeDetails[tradeHash].status == TradeStatus.None,
            WrongTradeStatus()
        );

        // Start trade
        IERC20(params.depositAsset).safeTransferFrom(
            params.initiator,
            address(this),
            params.initiatorAmount
        );
        IERC20(params.depositAsset).safeTransferFrom(
            msg.sender,
            address(this),
            params.acceptorAmount
        );
        tradeDetails[tradeHash] = TradeDetails({
            status: TradeStatus.Started,
            acceptor: msg.sender
        });

        emit TradeStarted(tradeHash, params);
    }

    function cancelTrade(TradeParams calldata params) external {
        // Checks
        require(params.initiator == msg.sender, NotTradeInitiator());

        bytes32 tradeHash = _hashTypedDataV4(_hashTradeParams(params));
        require(
            tradeDetails[tradeHash].status == TradeStatus.None,
            WrongTradeStatus()
        );

        // Cancel trade
        tradeDetails[tradeHash].status = TradeStatus.Cancelled;

        emit TradeCancelled(tradeHash);
    }

    function settleTrade(
        TradeParams calldata params,
        bytes calldata extraData
    ) external payable returns (address winner, uint256 payoff) {
        // Checks
        bytes32 tradeHash = _hashTypedDataV4(_hashTradeParams(params));
        TradeDetails memory details = tradeDetails[tradeHash];
        require(details.status == TradeStatus.Started, WrongTradeStatus());

        require(block.timestamp >= params.expiry, TradeNotExpired());

        // Get price
        uint256 settlementPrice = _getPrice(
            params.dataSourceId,
            params.observationAssetId,
            params.expiry,
            extraData
        );

        // Determine winner and payoff
        winner = details.acceptor;
        if (
            (params.direction == BasicTradeDirection.Above &&
                settlementPrice >= params.price) ||
            (params.direction == BasicTradeDirection.Below &&
                settlementPrice <= params.price)
        ) {
            winner = params.initiator;
        }

        payoff = params.initiatorAmount + params.acceptorAmount;

        // Settle trade
        IERC20(params.depositAsset).safeTransfer(winner, payoff);

        tradeDetails[tradeHash].status = TradeStatus.Settled;

        emit TradeSettled(tradeHash, settlementPrice, winner, payoff);
    }

    // INTERNAL FUNCTION

    function _hashTradeParams(
        TradeParams calldata params
    ) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TRADE_TYPEHASH,
                    params.depositAsset,
                    params.initiator,
                    params.initiatorAmount,
                    params.acceptor,
                    params.acceptorAmount,
                    params.acceptionDeadline,
                    params.expiry,
                    params.observationAssetId,
                    params.direction,
                    params.price,
                    params.dataSourceId,
                    params.nonce
                )
            );
    }

    function _convertPrice(
        int256 price,
        uint32 currentDecimals
    ) private pure returns (uint256) {
        int256 convertedPrice;
        if (currentDecimals < TARGET_DECIMALS) {
            convertedPrice =
                price *
                int256(10 ** uint256(TARGET_DECIMALS - currentDecimals));
        } else if (currentDecimals > TARGET_DECIMALS) {
            convertedPrice =
                price /
                int256(10 ** uint256(currentDecimals - TARGET_DECIMALS));
        } else {
            convertedPrice = price;
        }
        return convertedPrice.toUint256();
    }

    function _getPrice(
        uint8 dataSourceId,
        uint32 assetId,
        uint256 timestamp,
        bytes calldata extraData
    ) internal returns (uint256) {
        if (dataSourceId == CHAINLINK_DATA_SOURCE_ID) {
            AggregatorV3Interface priceFeed = AggregatorV3Interface(
                chainlinkAssetPriceFeeds[assetId]
            );
            uint80 priceRoundId = abi.decode(extraData, (uint80));

            (, int256 answer, , uint256 priceTimestamp, ) = priceFeed
                .getRoundData(priceRoundId);

            require(
                priceTimestamp != 0 && priceTimestamp <= timestamp,
                InvalidChainlinkRoundId()
            );

            (, , , uint256 nextTimestamp, ) = priceFeed.getRoundData(
                priceRoundId + 1
            );

            require(
                nextTimestamp == 0 || nextTimestamp > timestamp,
                InvalidChainlinkRoundId()
            );

            return _convertPrice(answer, CHAILINK_DECIMALS);
        } else if (dataSourceId == PYTH_DATA_SOURCE_ID) {
            bytes32 priceFeedId = pythAssetFeedIds[assetId];

            bytes[] memory updateDatas = new bytes[](1);
            updateDatas[0] = extraData;
            bytes32[] memory priceFeedIds = new bytes32[](1);
            priceFeedIds[0] = priceFeedId;
            PythStructs.PriceFeed[] memory priceFeeds = pyth
                .parsePriceFeedUpdates{ value: msg.value }(
                updateDatas,
                priceFeedIds,
                timestamp.toUint64(),
                timestamp.toUint64()
            );

            require(priceFeeds.length == 1, InvalidPythResponse());
            require(priceFeeds[0].id == priceFeedId, InvalidPythResponse());

            return
                _convertPrice(
                    priceFeeds[0].price.price,
                    uint32(-1 * priceFeeds[0].price.expo)
                );
        } else {
            revert InvalidDataSource();
        }
    }
}

# Market Minds Smart Contracts

This respository contains smart contracts for Market Minds predictions protocol.
It's a Hardhat project containing Solidity contracts, as well as tests &
deployment scripts for them.

## Deployments

Contracts are deployed to 12 EVM networks. Addresses and explorer links can be
found in table below

| Network           | Trade Entry                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Sepolia (Mainnet) | [0x7A643265a46A77Bfe7a7C62125F98CF278C7AEa9](https://sepolia.etherscan.io/address/0x7A643265a46A77Bfe7a7C62125F98CF278C7AEa9)          |
| Polygon Amoy      | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://amoy.polygonscan.com/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)          |
| Arbitrum Sepolia  | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://sepolia.arbiscan.io/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)           |
| Base Sepolia      | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://base-sepolia.blockscout.com/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)   |
| Celo Alfajores    | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://celo-alfajores.blockscout.com/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31) |
| Scroll Sepolia    | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://sepolia.scrollscan.com/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)        |
| Linea             | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://lineascan.build/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)               |
| Hedera Testnet    | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://hashscan.io/testnet/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)           |
| Flow Testnet      | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://evm-testnet.flowscan.io/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)       |
| Mantle Sepolia    | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://explorer.sepolia.mantle.xyz/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)   |
| Neon Devnet       | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://neon-devnet.blockscout.com/address/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)    |
| Chiliz Testnet    | [0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31](https://spicy-explorer.chiliz.com/0x001BF4FAfe6b4ba7091d5e6D2b4ba0671882DE31)             |

## Contract Structure

Protocol's primary contract is `TradeEntry`. It exposes 3 functions for regular
users:

```
function startTrade(
    TradeParams calldata params,
    bytes calldata initiatorSignature
) external returns (bytes32 tradeHash)
```

Function accepts `params` object with initiator's bet and `initiatorSignature`
(EIP712 signature of first object) Accepts initiator's and acceptor's deposits
and starts a trade (bet) Returns `tradeHash` that serves as bet's identifier

```
function cancelTrade(TradeParams calldata params) external
```

Accepts `params` and cancels this bet's initiation (so other acceptor can't
start it)

```
function settleTrade(
    TradeParams calldata params,
    bytes calldata extraData
) external payable returns (address winner, uint256 payoff)
```

Accepts `paramts` object with bet and `extraData` containing oracle-specific
data for price determination. Settles the bet based on the expiry price and
transfers `payoff` to `winner`

## Usage

### Dependencies

Make sure that you have Node and NPM installed. Run

```
npm install
```

To compile contracts run:

```
npx hardhat compile
```

To test contracts run:

```
npx hardhat test
```

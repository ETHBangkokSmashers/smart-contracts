import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const networkConfig = (url: string | null | undefined) => ({
  url: url || "",
  accounts:
    process.env.DEPLOYER_PRIVATE_KEY && process.env.ACCEPTOR_PRIVATE_KEY
      ? [process.env.DEPLOYER_PRIVATE_KEY, process.env.ACCEPTOR_PRIVATE_KEY]
      : [],
});

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.27",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: networkConfig(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    ),
    sepolia: networkConfig(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    ),
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHSCAN_API_KEY ?? "",
      sepolia: process.env.ETHSCAN_API_KEY ?? "",
    },
  },
};

export default config;

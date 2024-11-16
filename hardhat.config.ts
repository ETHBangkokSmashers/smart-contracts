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
    sepolia: networkConfig(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    ),
    polygonAmoy: networkConfig("https://rpc.ankr.com/polygon_amoy"),
    arbitrumSepolia: networkConfig("https://rpc.ankr.com/arbitrum_sepolia"),
    baseSepolia: networkConfig("https://rpc.ankr.com/base_sepolia"),
    celoAlfajores: networkConfig("https://alfajores-forno.celo-testnet.org"),
    scrollSepolia: networkConfig("https://rpc.ankr.com/scroll_sepolia_testnet"),
    linea: networkConfig("https://rpc.linea.build"), // Need
    hederaTestnet: networkConfig("https://testnet.hashio.io/api"),
    flowTestnet: networkConfig("https://testnet.evm.nodes.onflow.org"),
    mantleSepolia: networkConfig("https://rpc.sepolia.mantle.xyz"), // Need
    kinto: networkConfig("https://rpc.kinto.xyz/http"), // Need
    neonDevnet: networkConfig("https://devnet.neonevm.org"),
    bitkubTestnet: networkConfig("https://rpc-testnet.bitkubchain.io"), // Need
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHSCAN_API_KEY ?? "",
    },
  },
};

export default config;

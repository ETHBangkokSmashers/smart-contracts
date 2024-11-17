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
    polygonAmoy: networkConfig("https://rpc.ankr.com/polygon_amoy"), // Missing Blockscot
    arbitrumSepolia: networkConfig("https://rpc.ankr.com/arbitrum_sepolia"),
    baseSepolia: networkConfig("https://rpc.ankr.com/base_sepolia"),
    celoAlfajores: networkConfig("https://alfajores-forno.celo-testnet.org"),
    scrollSepolia: networkConfig("https://rpc.ankr.com/scroll_sepolia_testnet"),
    linea: networkConfig("https://rpc.linea.build"),
    hederaTestnet: networkConfig("https://testnet.hashio.io/api"),
    flowTestnet: networkConfig("https://testnet.evm.nodes.onflow.org"),
    mantleSepolia: networkConfig("https://rpc.sepolia.mantle.xyz"),
    neonDevnet: networkConfig("https://devnet.neonevm.org"),
    bitkubTestnet: networkConfig("https://rpc-testnet.bitkubchain.io"), // Need
    chilizTestnet: networkConfig("https://spicy-rpc.chiliz.com"),
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHSCAN_API_KEY ?? "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY ?? "",
      arbitrumSepolia: process.env.ARBISCAN_API_KEY ?? "",
      baseSepolia: "abc",
      celoAlfajores: "abc",
      scrollSepolia: process.env.SCROLLSCAN_API_KEY ?? "",
      linea: process.env.LINEASCAN_API_KEY ?? "",
      hederaTestnet: "abc",
      flowTestnet: "abc",
      mantleSepolia: "abc",
      neonDevnet: "abc",
      chilizTestnet: "abc",
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://eth-sepolia.blockscout.com/api",
          browserURL: "https://eth-sepolia.blockscout.com",
        },
      },
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api",
          browserURL: "https://base-sepolia.blockscout.com",
        },
      },
      {
        network: "celoAlfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://celo-alfajores.blockscout.com/api",
          browserURL: "https://celo-alfajores.blockscout.com",
        },
      },
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://api-sepolia.scrollscan.com",
        },
        /*urls: {
          apiURL: "https://scroll-sepolia.blockscout.com/api",
          browserURL: "https://scroll-sepolia.blockscout.com",
        },*/
      },
      {
        network: "linea",
        chainId: 59144,
        urls: {
          apiURL: "https://api.lineascan.build/api",
          browserURL: "https://lineascan.build",
        },
      },
      {
        network: "hederaTestnet",
        chainId: 296,
        urls: {
          apiURL: "https://server-verify.hashscan.io/",
          browserURL: "https://hashscan.io/testnet",
        },
      },
      {
        network: "flowTestnet",
        chainId: 545,
        urls: {
          apiURL: "https://evm-testnet.flowscan.io/api",
          browserURL: "https://evm-testnet.flowscan.io",
        },
      },
      {
        network: "mantleSepolia",
        chainId: 5003,
        urls: {
          apiURL: "https://explorer.sepolia.mantle.xyz/api",
          browserURL: "https://explorer.sepolia.mantle.xyz",
        },
      },
      {
        network: "neonDevnet",
        chainId: 245022926,
        urls: {
          apiURL: "https://neon-devnet.blockscout.com/api",
          browserURL: "https://neon-devnet.blockscout.com",
        },
      },
      {
        network: "chilizTestnet",
        chainId: 88882,
        urls: {
          apiURL: "https://spicy-explorer.chiliz.com/api",
          browserURL: "https://spicy-explorer.chiliz.com",
        },
      },
    ],
  },
};

export default config;

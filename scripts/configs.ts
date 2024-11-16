type NetworkConfig = {
  [key: string]: {
    chainlink: {
      enabled: boolean;
      btcFeed?: string;
      ethFeed?: string;
    };
    pyth: {
      enabled: boolean;
      address?: string;
    };
  };
};

export const Config: NetworkConfig = {
  sepolia: {
    chainlink: {
      enabled: true,
      btcFeed: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      ethFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    pyth: {
      enabled: true,
      address: "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21",
    },
  },
  polygonAmoy: {
    chainlink: {
      enabled: true,
      btcFeed: "0xe7656e23fE8077D438aEfbec2fAbDf2D8e070C4f",
      ethFeed: "0xF0d50568e3A7e8259E16663972b11910F89BD8e7",
    },
    pyth: {
      enabled: true,
      address: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    },
  },
  arbitrumSepolia: {
    chainlink: {
      enabled: true,
      btcFeed: "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69",
      ethFeed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
    },
    pyth: {
      enabled: true,
      address: "0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF",
    },
  },
  baseSepolia: {
    chainlink: {
      enabled: true,
      btcFeed: "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298",
      ethFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    },
    pyth: {
      enabled: true,
      address: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    },
  },
  celoAlfajores: {
    chainlink: {
      enabled: true,
      btcFeed: "0xC0f1567a0037383068B1b269A81B07e76f99710c",
      ethFeed: "0x7b298DA61482cC1b0596eFdb1dAf02C246352cD8",
    },
    pyth: {
      enabled: true,
      address: "0x74f09cb3c7e2A01865f424FD14F6dc9A14E3e94E",
    },
  },
  scrollSepolia: {
    chainlink: {
      enabled: true,
      btcFeed: "0x87dce67002e66C17BC0d723Fe20D736b80CAaFda",
      ethFeed: "0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41",
    },
    pyth: {
      enabled: true,
      address: "0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c",
    },
  },
  linea: {
    chainlink: {
      enabled: true,
      btcFeed: "0x7A99092816C8BD5ec8ba229e3a6E6Da1E628E1F9",
      ethFeed: "0x3c6Cd9Cc7c7a4c2Cf5a82734CD249D7D593354dA",
    },
    pyth: {
      enabled: true,
      address: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
    },
  },
  hederaTestnet: {
    chainlink: {
      enabled: true,
      btcFeed: "0x058fE79CB5775d4b167920Ca6036B824805A9ABd",
      ethFeed: "0xb9d461e0b962aF219866aDfA7DD19C52bB9871b9",
    },
    pyth: {
      enabled: true,
      address: "0xa2aa501b19aff244d90cc15a4cf739d2725b5729",
    },
  },
  flowTestnet: {
    chainlink: {
      enabled: false,
    },
    pyth: {
      enabled: true,
      address: "0x2880aB155794e7179c9eE2e38200202908C17B43",
    },
  },
  mantleSepolia: {
    chainlink: {
      enabled: false,
    },
    pyth: {
      enabled: true,
      address: "0x98046Bd286715D3B0BC227Dd7a956b83D8978603",
    },
  },
  neonDevnet: {
    chainlink: {
      enabled: false,
    },
    pyth: {
      enabled: true,
      address: "0x0708325268dF9F66270F1401206434524814508b",
    },
  },
  bitkubTestnet: {
    chainlink: {
      enabled: true,
      btcFeed: "0xFDd3A5C3E27506F942139EE858EC61a7174681ed",
      ethFeed: "0xDA1891Cc504B104B69fCF9DCBB855d0c77098BcB",
    },
    pyth: {
      enabled: false,
    },
  },
  chilizTestnet: {
    chainlink: {
      enabled: false,
    },
    pyth: {
      enabled: true,
      address: "0x23f0e8FAeE7bbb405E7A7C3d60138FCfd43d7509",
    },
  },
};

type NetworkConfig = {
  [key: string]: {
    chainlink: {
      enabled: boolean;
      btcFeed?: string;
      ethFeed?: string;
    };
    pyth: {
      enabled: true;
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
};

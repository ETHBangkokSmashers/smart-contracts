type NetworkConfig = {
  [key: string]: {
    chainlink: {
      enabled: boolean;
      btcFeed?: string;
      ethFeed?: string;
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
  },
};

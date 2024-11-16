import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeEntry = buildModule("TradeEntry", (m) => {
  const tradeEntry = m.contract("TradeEntry", []);

  const usdc = m.contract("USDC", []);

  return { tradeEntry, usdc };
});

export default TradeEntry;

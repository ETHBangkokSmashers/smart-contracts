import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TradeEntry = buildModule("TradeEntry", (m) => {
  const tradeEntry = m.contract("TradeEntry", []);

  m.call(tradeEntry, "initialize", []);

  return { tradeEntry };
});

export default TradeEntry;

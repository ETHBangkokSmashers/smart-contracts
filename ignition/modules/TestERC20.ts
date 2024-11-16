import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TestERC20 = buildModule("TestERC20", (m) => {
  const testERC20 = m.contract("TestERC20", []);

  return { testERC20 };
});

export default TestERC20;

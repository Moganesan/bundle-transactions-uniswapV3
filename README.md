Send bundle transactions using flashbot bundler <br/>
.env<br/>
INFURA_PROJECT_ID=4950a9bc37a04f44b99b5625d53f8d79<br/>
PRIVATE_KEYS=b985fdb9584064288c2b468cff4a6432a33e1cf91fb8c93992353e464d543e32<br/>
<br/>

The main goal of this script is to send multiple Uniswap swap transactions in a single transaction using Flashbots.
<br/>

src/createLiquidityPool.ts -> to create test liquidity pool token for performing swap
<br />
src/index.ts -> Send the bundled transaction to Flashbots, and it will mine the transaction on the Sepolia testnet.

# Flashbots Bundled Transactions Script

This script allows you to send multiple Uniswap swap transactions in a single bundled transaction using Flashbots on the Sepolia testnet.

## Features

1. **Bundle Transactions:**
   - Combine multiple Uniswap swap transactions into a single bundled transaction.
2. **Transaction Management:**

   - Efficiently manage and send transactions through Flashbots.

3. **Transactions Prioritization:**

   - Prioritizing transactions based of gasLimit

4. **Sepolia Network Integration:**
   - Utilize the Flashbots Sepolia testnet for transaction mining.

## Getting Starte

## Packages

- @uniswap/v3-core
- @uniswap/v3-periphery/
- @flashbots/ethers-provider-bundle

### Configuration

- run npx ts-node src/createLiquidityPool.ts to create new liquidityPool and get the token pairs and pool contract addres.
- run npx ts-node src/index.ts to send bundled tx to sepolia using flashbot ethereum provider
- A Flashbots relay endpoint

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flashbots-bundled-transactions.git
   cd flashbots-bundled-transactions
   ```

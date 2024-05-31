import dotenv from "dotenv";
dotenv.config();
import { Wallet, ethers } from "ethers";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, BigintIsh } from "@uniswap/sdk-core";
import IUniswapv3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import IUniswapv3PoolFactory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import SwapRouter from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";
import ERC20Abi from "../erc20.json";
import axios from "axios";

const provider = new ethers.providers.InfuraProvider(
  "sepolia",
  process.env.INFURA_PROJECT_ID
);

const poolAddress = "0x4D7C363DED4B3b4e1F954494d2Bc3955e49699cC"; // UNI/WETH
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

const name0 = "Wrapped Ether";
const symbol0 = "WETH";
const decimals0 = 18;
const address0 = "0xc778417e063141139fce010982780140aa0cd5ab";

const name1 = "Uniswap Token";
const symbol1 = "UNI";
const decimals1 = 18;
const address1 = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";

async function createSwapOrder(wallet, amountIn, tokenIn, tokenOut, gasPrice) {
  const router = new AlphaRouter({ chainId: 11155111, provider });
  const inputToken = new Token(11155111, tokenIn, 18);
  const outputToken = new Token(11155111, tokenOut, 18);

  const amountInBigInt = ethers.utils
    .parseUnits(amountIn.toString(), inputToken.decimals)
    .toString();

  const route = await router.route(
    CurrencyAmount.fromRawAmount(inputToken, amountInBigInt),
    outputToken,
    TradeType.EXACT_INPUT
  );

  const transaction = {
    data: route.methodParameters.calldata,
    to: process.env.UNISWAP_ROUTER_ADDRESS,
    value: ethers.BigNumber.from(route.methodParameters.value),
    from: wallet.address,
    gasPrice: ethers.utils.parseUnits(gasPrice.toString(), "gwei"),
    gasLimit: ethers.BigNumber.from("1000000"),
  };

  return transaction;
}

async function main() {
  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapv3Factory.abi,
    provider
  );
  const privateKeys = process.env.PRIVATE_KEYS.split(",");
  const walletAddress = "0x17206eE0F5F452cc9EA68374e2fe7BC62400c3A1";

  const swapRouterContract = new ethers.Contract(
    swapRouterAddress,
    SwapRouter.abi,
    provider
  );
  const wallets = privateKeys.map((pk) => new ethers.Wallet(pk, provider));
  const transactions = [];

  for (let i = 0; i < 2; i++) {
    const transaction = await createSwapOrder(
      wallets[0],
      1,
      address0,
      address1,
      20 // Gas price in Gwei
    );
    transactions.push(transaction);
  }

  await axios.post(process.env.BLOXROUTE_API_URL, {
    method: "blxr_simulate_bundle",
    id: "1",
    params: {
      transaction: prioritizeTransactions(transactions),
      block_number: "0xba10d0",
      state_block_number: "latest",
      timestamp: 1617806320,
      blockchain_network: "Mainnet",
    },
  });
}

function prioritizeTransactions(transactions) {
  return transactions.sort((a, b) => {
    const feeA = ethers.utils.parseUnits(a.gasPrice.toString(), "gwei");
    const feeB = ethers.utils.parseUnits(b.gasPrice.toString(), "gwei");
    return feeB.sub(feeA);
  });
}
main();

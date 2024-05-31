import dotenv from "dotenv";
dotenv.config();
import { Wallet, ethers } from "ethers";
import {
  AlphaRouter,
  SwapAndAddOptions,
  SwapType,
} from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import IUniswapv3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import IUniswapv3PoolFactory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import SwapRouter from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";
import ERC20Abi from "../erc20.json";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";

import axios from "axios";

const provider = new ethers.providers.InfuraProvider(
  "sepolia",
  process.env.INFURA_PROJECT_ID
);

const wallet = new ethers.Wallet(
  "b985fdb9584064288c2b468cff4a6432a33e1cf91fb8c93992353e464d543e32",
  provider
);

const poolAddress = "0x4D7C363DED4B3b4e1F954494d2Bc3955e49699cC"; // UNI/WETH
const swapRouterAddress = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";

const name0 = "Usdc";
const symbol0 = "USDC";
const decimals0 = 18;
const address0 = "0x66e0Ddc94E28047086A676cD38F104125F61AbA0";

const name1 = "Usdt";
const symbol1 = "USDT";
const decimals1 = 18;
const address1 = "0x7903d1F60f236EE9d496fEe13B793683f411a460";

async function createSwapOrder(
  wallet,
  amountIn,
  tokenIn,
  tokenOut,
  gasPrice,
  gasLimit
) {
  // give approval to the router contract to transfer tokens
  await getTokenTransferApproval(tokenIn, swapRouterAddress);

  await getTokenTransferApproval(tokenOut, swapRouterAddress);

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
    gasLimit: gasLimit,
  };

  return transaction;
}

async function signTransaction(transaction) {
  return await wallet.signTransaction(transaction);
}

export async function getTokenTransferApproval(
  token: Token,
  spenderAddress: string
) {
  const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 1000000000000;

  try {
    const tokenContract = new ethers.Contract(token.address, ERC20Abi, wallet);

    const transaction = await tokenContract.approve(
      spenderAddress,
      TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
    );
    await transaction.wait();
  } catch (e) {
    console.error(e);
  }
}

async function getPoolInfo() {
  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapv3PoolFactory.abi,
    provider
  );

  const [token0, token1, fee, liquidity, slot0] = await Promise.all([
    poolContract.token0(),
    poolContract.token1(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    token0,
    token1,
    fee,
    liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function sendFlashbotsBundle(transactions) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ETH_NODE_URL
  );
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    wallet,
    "‘https://relay-sepolia.flashbots.net"
  );

  const bundleSubmission: any = await flashbotsProvider.sendBundle(
    transactions.map((tx) => ({ signedTransaction: tx })),
    Math.floor(Date.now() / 1000) + 60 // Target block time
  );

  const bundleReceipt = bundleSubmission.wait();
  if (bundleReceipt === 0) {
    console.log(" - Transaction is mined - ");
    for (const signedTx of transactions) {
      console.log("Transaction Hash:", ethers.utils.keccak256(signedTx));
    }
  } else {
    console.log("Error submitting transaction");
  }
}

async function main() {
  const privateKeys = process.env.PRIVATE_KEYS.split(",");

  const wallets = privateKeys.map((pk) => new ethers.Wallet(pk, provider));
  const transactions = [];
  const gasLimits = [
    ethers.utils.parseUnits("10000", "gwei"),
    ethers.utils.parseUnits("20000", "gwei"),
    ethers.utils.parseUnits("40000", "gwei"),
    ethers.utils.parseUnits("30000", "gwei"),
  ];

  for (let i = 0; i < 4; i++) {
    const transaction = await createSwapOrder(
      wallets[0],
      1,
      address0,
      address1,
      20,
      gasLimits[i]
    );
    transactions.push(transaction);
  }
  // prioritize high gas tx
  const tx = prioritizeTransactions(transactions);
  const signedTransactions = tx.map((tx) => signTransaction(tx));

  sendFlashbotsBundle(signedTransactions);
}

function prioritizeTransactions(transactions) {
  return transactions.sort((a, b) => {
    const feeA = ethers.utils.parseUnits(a.gasPrice.toString(), "gwei");
    const feeB = ethers.utils.parseUnits(b.gasPrice.toString(), "gwei");
    return feeB.sub(feeA);
  });
}
main();

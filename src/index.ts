import chalk from "chalk";
import { task, types } from "hardhat/config";
import { BigNumber, ethers } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  Percent,
  CurrencyAmount,
  TradeType,
  Token,
  V2_ROUTER_ADDRESSES,
  V2_FACTORY_ADDRESSES,
  V3_CORE_FACTORY_ADDRESSES,
  SWAP_ROUTER_02_ADDRESSES,
} from "@uniswap/sdk-core";
import { AlphaRouter, SwapType, SwapRoute } from "@uniswap/smart-order-router";
import { FlashbotsBundleProvider } from "./flashbot";

const ERC20Abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
];
const factoryAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        indexed: true,
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    name: "FeeAmountEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnerChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        indexed: false,
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
      {
        indexed: false,
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenB",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
    ],
    name: "createPool",
    outputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    name: "enableFeeAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    name: "feeAmountTickSpacing",
    outputs: [
      {
        internalType: "int24",
        name: "",
        type: "int24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    name: "getPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "parameters",
    outputs: [
      {
        internalType: "address",
        name: "factory",
        type: "address",
      },
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint24",
        name: "fee",
        type: "uint24",
      },
      {
        internalType: "int24",
        name: "tickSpacing",
        type: "int24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const SWAP_ROUTER_ADDRESS = "0xec7BE89e9d109e7e3Fec59c222CF297125FEFda2";
const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mainnet.infura.io/v3/4950a9bc37a04f44b99b5625d53f8d79"
);

const wallet = new ethers.Wallet(
  "f659c323c68c70f640251b97ba253e52d1a568999a4da0aea129c13d054155f1",
  provider
);
async function generateRoute(
  tokenIn: Token,
  amountIn: BigNumber,
  tokenOut: Token
): Promise<SwapRoute> {
  const router = new AlphaRouter({
    chainId: (await provider.getNetwork()).chainId,
    provider,
  });

  const signerAddress = await wallet.getAddress();

  const slippageTolerance = new Percent(5, 100);
  const deadline = Date.now() + 15000;

  // Generate the route using tokenIn, tokenOut, and options
  const route = await router.route(
    CurrencyAmount.fromRawAmount(tokenIn, amountIn.toString()),
    tokenOut,
    TradeType.EXACT_INPUT,
    {
      recipient: signerAddress,
      slippageTolerance: slippageTolerance,
      deadline: deadline,
      type: SwapType.SWAP_ROUTER_02,
    }
  );

  if (!route) {
    throw new Error("No route found for the specified swap.");
  }

  console.log(route.methodParameters);

  return route;
}

export async function getTokenMetadata(tokenAddress: string) {
  const chainId = (await provider.getNetwork()).chainId;

  const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, provider);
  const decimals = await tokenContract.decimals();
  const symbol = await tokenContract.symbol();
  const name = await tokenContract.name();

  return new Token(chainId, tokenAddress, decimals, symbol, name);
}
export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: string
) {
  console.log("Token Approval Started");
  const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, wallet);
  const decimals = await tokenContract.decimals();
  const rawAmount = ethers.utils.parseUnits(amount, decimals);

  const approveTx = await tokenContract.approve(spenderAddress, rawAmount);

  console.log(approveTx);

  const approveTxReceipt = await approveTx.wait();
  if (approveTxReceipt.status !== 1) {
    throw new Error("Transfer approval failed");
  }

  console.log(chalk.green(`Approved ${spenderAddress} tokens`));
}

async function executeSwap(route: SwapRoute, gasLimit: BigNumber) {
  const tokenIn = route.trade.routes[0].input;
  const amountIn = route.trade.swaps[0].inputAmount.toExact();

  // Approve tokenIn to be transferred by the router
  // await approveToken((tokenIn as Token).address, SWAP_ROUTER_ADDRESS, amountIn);

  // Calculate gas fee configuration
  const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
  if (!maxFeePerGas || !maxPriorityFeePerGas) {
    throw new Error("Failed to fetch gas fee data");
  }

  if (!route.methodParameters)
    throw new Error("Failed to fetch route.methodParameters");

  console.log("Sending swap transaction...");
  const signer = wallet;
  const swapTx = {
    data: route.methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: route.methodParameters.value,
    from: signer.address,
    // maxFeePerGas: maxFeePerGas,
    gasLimit: gasLimit,
    // maxPriorityFeePerGas: maxPriorityFeePerGas,
  };

  return swapTx;
}

async function signTransaction(transaction: any) {
  try {
    return await wallet.signTransaction(transaction);
  } catch (err) {
    console.log("Sign TX Error", err);
  }
}

function prioritizeTransactions(transactions: any) {
  return transactions.sort((a: any, b: any) => {
    const feeA = ethers.utils.parseUnits(a.gasPrice.toString(), "gwei");
    const feeB = ethers.utils.parseUnits(b.gasPrice.toString(), "gwei");
    return feeB.sub(feeA);
  });
}

async function main() {
  const factoryAddress = V3_CORE_FACTORY_ADDRESSES["137"];
  const factoryContract = new ethers.Contract(
    factoryAddress.toString(),
    factoryAbi,
    wallet
  );

  const gasLimits = [
    ethers.utils.parseUnits("10000", "gwei"),
    ethers.utils.parseUnits("20000", "gwei"),
    ethers.utils.parseUnits("40000", "gwei"),
    ethers.utils.parseUnits("30000", "gwei"),
  ];

  const usdc = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

  const usdt = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

  const pool = await factoryContract.getPool(usdc, usdt, 3000);

  console.log("Factory Address", factoryAddress);

  console.log("Pool For the token pairs", pool);

  const tokenIn = await getTokenMetadata(usdc);
  const tokenOut = await getTokenMetadata(usdt);

  const transactions = [];

  for (let i = 0; i < 4; i++) {
    const route = await generateRoute(
      tokenIn,
      ethers.utils.parseEther("0.005"),
      tokenOut
    );
    const swap = await executeSwap(route, gasLimits[0]);
    transactions.push(swap);
  }

  const prioritizeTransactionsres: any = prioritizeTransactions(transactions);

  const signedTx = prioritizeTransactionsres.map((tx: any) =>
    signTransaction(tx)
  );

  sendFlashbotsBundle(signedTx);
}

async function sendFlashbotsBundle(transactions: any) {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.ETH_NODE_URL
  );
  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    wallet
  );

  const bundleSubmission: any = await flashbotsProvider.sendBundle(
    transactions.map((tx: any) => ({ signedTransaction: tx })),
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
main();

// @ts-nocheck
const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");
const { AlphaRouter } = require("@uniswap/smart-order-router");
const { Token, CurrencyAmount, TradeType } = require("@uniswap/sdk-core");
const IUniswapv3PoolFactory = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const ERC20Abi = require("../erc20.json");
const {
  FlashbotsBundleProvider,
} = require("@flashbots/ethers-provider-bundle");

const provider = new ethers.providers.InfuraProvider(
  "sepolia",
  "4950a9bc37a04f44b99b5625d53f8d79"
);

const wallet = new ethers.Wallet(
  "a4c8588868b95c74b4c358c9c6440de53a79b192a38d244716a14d01e3eb145d",
  provider
);

const poolAddress = "0xe8fa8F276Dc0315adD939977b5C6c58C79cDA147"; // USDC/USDT
const swapRouterAddress = "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD";

const name0 = "Usdc";
const symbol0 = "USDC";
const decimals0 = 18;
const address0 = "0x66e0Ddc94E28047086A676cD38F104125F61AbA0";

const name1 = "Usdt";
const symbol1 = "USDT";
const decimals1 = 18;
const address1 = "0x7903d1F60f236EE9d496fEe13B793683f411a460";

// async function createSwapOrder(
//   wallet,
//   amountIn,
//   tokenIn,
//   tokenOut,
//   gasPrice,
//   gasLimit
// ) {
//   // give approval to the router contract to transfer tokens
//   await getTokenTransferApproval(tokenIn, swapRouterAddress);

//   await getTokenTransferApproval(tokenOut, swapRouterAddress);

//   const router = new AlphaRouter({ chainId: 11155111, provider });

//   const inputToken = new Token(11155111, tokenIn, 18);
//   const outputToken = new Token(11155111, tokenOut, 18);

//   const amountInBigInt = ethers.utils
//     .parseUnits(amountIn.toString(), inputToken.decimals)
//     .toString();
//   try {
//     const route = await router.route(
//       CurrencyAmount.fromRawAmount(inputToken, amountInBigInt),
//       outputToken,
//       TradeType.EXACT_INPUT
//     );

//     const transaction = {
//       data: route.methodParameters.calldata,
//       to: process.env.UNISWAP_ROUTER_ADDRESS,
//       value: ethers.BigNumber.from(route.methodParameters.value),
//       from: wallet.address,
//       gasPrice: ethers.utils.parseUnits(gasPrice.toString(), "gwei"),
//       gasLimit: gasLimit,
//     };

//     return transaction;
//   } catch (err) {
//     console.log("Router Error");
//   }
// }

// async function signTransaction(transaction) {
//   try {
//     return await wallet.signTransaction(transaction);
//   } catch (err) {
//     console.log("Try Tx Error", err);
//   }
// }

// export async function getTokenTransferApproval(
//   token: Token,
//   spenderAddress: string
// ) {
//   const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 1000000000000;

//   try {
//     const tokenContract = new ethers.Contract(token.address, ERC20Abi, wallet);

//     const transaction = await tokenContract.approve(
//       spenderAddress,
//       TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
//     );
//     await transaction.wait();
//   } catch (e) {
//     console.log("Approve Error");
//     console.error(e);
//   }
// }

// async function getPoolInfo() {
//   const poolContract = new ethers.Contract(
//     poolAddress,
//     IUniswapv3PoolFactory.abi,
//     provider
//   );

//   const [token0, token1, fee, liquidity, slot0] = await Promise.all([
//     poolContract.token0(),
//     poolContract.token1(),
//     poolContract.fee(),
//     poolContract.liquidity(),
//     poolContract.slot0(),
//   ]);

//   return {
//     token0,
//     token1,
//     fee,
//     liquidity,
//     sqrtPriceX96: slot0[0],
//     tick: slot0[1],
//   };
// }

async function sendFlashbotsBundle(transactions) {
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     "https://mainnet.infura.io/v3/"
  //   );
  //   const flashbotsProvider = await FlashbotsBundleProvider.create(
  //     provider,
  //     wallet
  //   );
  // const bundleSubmission: any = await flashbotsProvider.sendBundle(
  //   transactions.map((tx) => ({ signedTransaction: tx })),
  //   Math.floor(Date.now() / 1000) + 60 // Target block time
  // );
  // const bundleReceipt = bundleSubmission.wait();
  // if (bundleReceipt === 0) {
  //   console.log(" - Transaction is mined - ");
  //   for (const signedTx of transactions) {
  //     console.log("Transaction Hash:", ethers.utils.keccak256(signedTx));
  //   }
  // } else {
  //   console.log("Error submitting transaction");
  // }
}

async function main() {
  console.log("Works");
  // const privateKeys = process.env.PRIVATE_KEYS.split(",");
  // const wallets = privateKeys.map((pk) => new ethers.Wallet(pk, provider));
  // const transactions = [];
  // const gasLimits = [
  //   ethers.utils.parseUnits("10000", "gwei"),
  //   ethers.utils.parseUnits("20000", "gwei"),
  //   ethers.utils.parseUnits("40000", "gwei"),
  //   ethers.utils.parseUnits("30000", "gwei"),
  // ];
  // const exampleTx = await createSwapOrder(
  //   wallet.address,
  //   1,
  //   address0,
  //   address1,
  //   20,
  //   ethers.utils.parseUnits("40000", "gwei")
  // );
  // console.log(exampleTx);
  // for (let i = 0; i < 4; i++) {
  //   const transaction = await createSwapOrder(
  //     wallets[0],
  //     1,
  //     address0,
  //     address1,
  //     20,
  //     gasLimits[i]
  //   );
  //   transactions.push(transaction);
  // }
  // // prioritize high gas tx
  // const tx = prioritizeTransactions(transactions);
  // const signedTransactions = tx.map((tx) => signTransaction(tx));
  // sendFlashbotsBundle(signedTransactions);
}

function prioritizeTransactions(transactions) {
  return transactions.sort((a, b) => {
    const feeA = ethers.utils.parseUnits(a.gasPrice.toString(), "gwei");
    const feeB = ethers.utils.parseUnits(b.gasPrice.toString(), "gwei");
    return feeB.sub(feeA);
  });
}

main();

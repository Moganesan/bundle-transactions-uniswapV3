import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import IUniswapv3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import IUniswapv3PoolFactory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import INonfungiblePositionManager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import ERC20Abi from "../src20.json";

const privateKeys = process.env.PRIVATE_KEYS?.split(",");

const provider = new ethers.providers.InfuraProvider(
  "sepolia",
  process.env.INFURA_PROJECT_ID
);

const wallet = new ethers.Wallet(privateKeys[0], provider);

const uniswapV3FactoryAddress = process.env.UNISWAP_FACTORY_ADDRESS;

const positionManagerAddress = process.env.UNISWAP_POSITION_MANAGER_ADDRESS;

async function createAndAddLiquidity() {
  const factory = new ethers.Contract(
    uniswapV3FactoryAddress,
    IUniswapv3Factory.abi,
    wallet
  );

  const positionManager = new ethers.Contract(
    positionManagerAddress,
    INonfungiblePositionManager.abi,
    wallet
  );

  const usdcToken = "0x66e0Ddc94E28047086A676cD38F104125F61AbA0";
  const usdtToken = "0x7903d1F60f236EE9d496fEe13B793683f411a460";

  const usdcAmount = ethers.utils.parseUnits("1000", 18);
  const usdtAmount = ethers.utils.parseUnits("1000", 18);

  // create pool 0.3% fee
  await factory.createPool(usdcToken, usdtToken, 3000);
  const poolAddress = await factory.getPool(usdcToken, usdtToken, 3000);
  const pool = new ethers.Contract(
    poolAddress,
    IUniswapv3PoolFactory.abi,
    wallet
  );

  // initialize pool
  await pool.initialize(ethers.utils.parseUnits("1", 18));

  // approve tokens for position manager
  const usdcContract = new ethers.Contract(usdcToken, ERC20Abi, wallet);

  const usdtContract = new ethers.Contract(usdtToken, ERC20Abi, wallet);

  await usdcContract.approve(positionManagerAddress, usdcAmount);
  await usdtContract.approve(positionManagerAddress, usdtAmount);

  // Add liquidity
  await positionManager.mint({
    token0: usdcToken,
    token1: usdtToken,
    fee: 3000,
    tickLower: -887220,
    tickUpper: 887220,
    amount0Desired: usdcAmount,
    amount1Desired: usdtAmount,
    amount0Min: 0,
    amount1Min: 0,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  });

  console.log("Liquidity Added Successfully!");
}

createAndAddLiquidity().catch(console.error);

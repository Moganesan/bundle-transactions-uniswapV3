import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import IUniswapv3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import IUniswapv3PoolFactory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import INonfungiblePositionManager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import ERC20Abi from "../erc20.json";

const provider = new ethers.providers.JsonRpcProvider({
  url: "https://eth-sepolia.g.alchemy.com/v2/HWKGQwzDCboz2c2pOOUoVv1ofzuVQ87A",
});

const wallet = new ethers.Wallet(
  "a4c8588868b95c74b4c358c9c6440de53a79b192a38d244716a14d01e3eb145d",
  provider
);

const uniswapV3FactoryAddress = "0x0227628f3F023bb0B980b67D528571c95c6DaC1c";

const positionManagerAddress = "0x1238536071E1c677A632429e3655c799b22cDA52";

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

  console.log("Wallet Address", wallet.address);
  console.log(
    "Balance",
    ethers.utils.formatEther(await provider.getBalance(wallet.address))
  );

  try {
    // create pool 0.3% fee

    // const feeData = await provider.getFeeData();

    // const gasLimit = ethers.BigNumber.from(2)
    //   .mul(ethers.utils.parseUnits("1", "ether"))
    //   .div(feeData.gasPrice);

    // const res = await factory.createPool(usdcToken, usdtToken, 3000);

    // console.log(res);
    // await res.wait();
    // console.log("Create Pool", res);
    const poolAddress = await factory.getPool(usdcToken, usdtToken, 3000);
    const pool = new ethers.Contract(
      poolAddress,
      IUniswapv3PoolFactory.abi,
      wallet
    );

    // const poolAddress = "0xe8fa8F276Dc0315adD939977b5C6c58C79cDA147";

    console.log("Pool Address", poolAddress);

    // initialize pool
    await pool.initialize(ethers.utils.parseUnits("1", 18), {
      gasLimit: (await provider.getBlock("latest")).gasLimit,
    });
    console.log("Pool Initialized");
  } catch (err) {
    console.log("Error From Creatng the pool", err);
    console.log(err);
    return;
  }

  // approve tokens for position manager
  const usdcContract = new ethers.Contract(usdcToken, ERC20Abi, wallet);

  const usdtContract = new ethers.Contract(usdtToken, ERC20Abi, wallet);

  await usdcContract.approve(positionManagerAddress, usdcAmount);
  await usdtContract.approve(positionManagerAddress, usdtAmount);

  try {
    // Add liquidity
    await positionManager.mint(
      {
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
      },
      { gasLimit: (await provider.getBlock("latest")).gasLimit }
    );

    console.log("Liquidity Added Successfully!");
  } catch (err) {
    console.log(err);
  }
}

createAndAddLiquidity().catch(console.error);

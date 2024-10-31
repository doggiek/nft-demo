const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const DoggieKToken = await ethers.getContractFactory("DoggieKToken");
  const token = await DoggieKToken.deploy(process.env.OWNER_ADDRESS);
  console.log("contract address: " + token.target);
}

main();

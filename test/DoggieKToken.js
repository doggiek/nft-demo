const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("DoggieKToken Contract", function () {
  let DoggieKToken;
  let token;
  let owner;

  beforeEach(async function () {
    DoggieKToken = await ethers.getContractFactory("DoggieKToken");
    [owner] = await ethers.getSigners();
    token = await DoggieKToken.deploy(owner);
    await token.waitForDeployment();
    console.log("contract address: " + token.address);
  });

  describe("Deployment", function () {
    it("should set the right name and symbol", async function () {
      expect(await token.name()).to.equal("DoggieKToken");
      expect(await token.symbol()).to.equal("DKT");
    });
  });

  describe("Minting NFTs", function () {
    it("should mint an NFT and increment tokenCounter", async function () {
      const uri = "https://ui-avatars.com/api/name=DoggieK&background=random";
      await token.safeMint(owner.address, uri); // 给自己挖
      expect(await token.balanceOf(owner.address)).to.equal(1);
      expect(await token.ownerOf(0)).to.equal(owner.address);
      expect(await token.tokenURI(0)).to.equal(uri);
      expect(await token.getCreator(0)).to.equal(owner.address);
    });
  });
});

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("NFT", function () {
  const baseURI = "http://localhost:3000/";

  async function fixture() {
    const [signer, minter, thirdAccount] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("Contract");
    const contract721: any = await Contract.connect(signer).deploy(
      "name",
      "symbol",
      signer.address,
      signer.address,
      0,
      "20000000000000000",
      "10000000000000000"
    );
    await contract721.lazyMint(10, "ipfs://xxx/", "0x");

    return { signer, minter, thirdAccount, contract721 };
  }

  describe("deployments", function () {
    it("should work", async function () {
      const { signer, contract721 } = await loadFixture(fixture);
      expect(await contract721.name()).to.eq("name");
      expect(await contract721.symbol()).to.eq("symbol");
      expect(await contract721.owner()).to.eq(signer.address);
    });

    it("should not work whith not owner", async function () {
      const { signer, minter, thirdAccount, contract721 } = await loadFixture(
        fixture
      );
      //   console.log(contract721);
      console.log("test");
      expect(await contract721.nextTokenIdToMint()).to.eq(10);

      await contract721.connect(minter).claimSBTorNFT(true, {
        value: ethers.utils.parseEther("0.01"),
      });
      await contract721.connect(minter).claimSBTorNFT(false, {
        value: ethers.utils.parseEther("0.02"),
      });

      await expect(
        contract721
          .connect(minter)
          .transferFrom(minter.address, thirdAccount.address, 0)
      ).to.revertedWith("This token is Soulbound");

      await contract721
        .connect(minter)
        .transferFrom(minter.address, thirdAccount.address, 1);
    });
  });
});

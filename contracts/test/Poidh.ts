import { ethers } from "hardhat";
import { expect } from "chai";

describe("POIDHNFT", function () {
  let poidhNFT: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const poidhNFTFactory = await ethers.getContractFactory("POIDHNFT");
    poidhNFT = await poidhNFTFactory.deploy();
  });

  describe("createBounty", function () {
    it("Should create a bounty with the correct id and amount", async function () {
      await poidhNFT.createBounty(
        "Bounty 1",
        "This is a bounty",
        { value: ethers.parseEther("1") }  // Sending 1 Ether
      );
      const bounty = await poidhNFT.bounties(0);
      expect(bounty.id).to.equal(0); // new test for ID
      expect(bounty.amount).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if the bounty amount is 0", async function () {
      await expect(poidhNFT.createBounty("Bounty 1", "This is a bounty", { value: 0 })).to.be.revertedWith("Bounty amount must be greater than 0");
    });
  });

  describe("createClaim", function () {
    beforeEach(async function () {
      await poidhNFT.createBounty("Bounty 1", "This is a bounty", { value: ethers.parseEther("1") });
    });

    it("Should create a claim for a bounty with correct id", async function () {
      await poidhNFT.createClaim(0, "Claim 1", "URI");
      const claim = await poidhNFT.claims(0);
      expect(claim.id).to.equal(0); // new test for ID
      expect(claim.bountyId).to.equal(0);
    });

    it("Should revert if the bounty does not exist", async function () {
      await expect(poidhNFT.createClaim(1, "Claim 1", "URI")).to.be.revertedWith("Bounty does not exist");
    });
  });

  describe("acceptClaim", function () {
    beforeEach(async function () {
      await poidhNFT.createBounty("Bounty 1", "This is a bounty", { value: ethers.parseEther("1") });
      await poidhNFT.connect(addr1).createClaim(0, "Claim 1", "URI");
    });

    it("Should accept a claim and transfer the bounty amount to the claim issuer", async function () {
      const initialBalance = await ethers.provider.getBalance(addr1.address);

      await poidhNFT.acceptClaim(0, 0);

      const finalBalance = await ethers.provider.getBalance(addr1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1"));
    });

    it("Should revert if the bounty does not exist", async function () {
      await expect(poidhNFT.acceptClaim(1, 0)).to.be.revertedWith("Bounty does not exist");
    });

    it("Should revert if the claim does not exist", async function () {
      await expect(poidhNFT.acceptClaim(0, 1)).to.be.revertedWith("Claim does not exist");
    });

    it("Should revert if the bounty has been claimed", async function () {
      await poidhNFT.acceptClaim(0, 0);
      await expect(poidhNFT.acceptClaim(0, 0)).to.be.revertedWith("Bounty already claimed");
    });

    it("Should revert if the bounty issuer is not the caller", async function () {
      const poidhNFTFromAddr1 = poidhNFT.connect(addr1);
      await expect(poidhNFTFromAddr1.acceptClaim(0, 0)).to.be.revertedWith("Only the bounty issuer can accept a claim");
    });
  });
});

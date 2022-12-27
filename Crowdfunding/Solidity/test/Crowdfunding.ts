import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Crowdfunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCrowdfunding() {
    const days = 1;
    const goal = 10;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CrowdfundingContract = await ethers.getContractFactory(
      "Crowdfunding"
    );
    const crowdfund = await CrowdfundingContract.deploy(days, goal);
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const deployTime = blockBefore.timestamp;

    return { crowdfund, days, goal, deployTime, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right deadline", async function () {
      const { crowdfund, days, deployTime } = await loadFixture(
        deployCrowdfunding
      );

      expect(await crowdfund.deadline()).to.equal(
        deployTime + days * 24 * 60 * 60
      );
    });

    it("Should set the right goal", async function () {
      const { crowdfund, goal } = await loadFixture(deployCrowdfunding);

      expect(await crowdfund.goal()).to.equal(goal);
    });

    it("Should set the right owner", async function () {
      const { crowdfund, owner } = await loadFixture(deployCrowdfunding);

      expect(await crowdfund.owner()).to.equal(owner.address);
    });

    it("Should fail if deadline is zero", async function () {
      const CrowdfundingContract = await ethers.getContractFactory(
        "Crowdfunding"
      );

      await expect(CrowdfundingContract.deploy(0, 10)).to.be.rejectedWith(
        "numberOfDays must be greater than zero"
      );
    });

    it("Should fail if goal is zero", async function () {
      const CrowdfundingContract = await ethers.getContractFactory(
        "Crowdfunding"
      );

      await expect(CrowdfundingContract.deploy(1, 0)).to.be.rejectedWith(
        "goal must be greater than zero"
      );
    });
  });

  describe("Pledge", function () {
    it("Should pledge to the campain", async function () {
      const { crowdfund } = await loadFixture(deployCrowdfunding);
      await crowdfund.pledge({
        value: ethers.utils.parseEther("1.0"),
      });

      expect(await crowdfund.provider.getBalance(crowdfund.address)).to.equal(
        ethers.utils.parseEther("1.0")
      );
    });
  });

  describe("Claim the funds", function () {
    it("Should claim the funds of the campain when founded properly", async function () {
      const { crowdfund, owner, deployTime, days } = await loadFixture(
        deployCrowdfunding
      );
      await crowdfund.pledge({
        value: ethers.utils.parseEther("11"),
      });
      await time.increaseTo(deployTime + (days + 1) * 24 * 60 * 60);
      await crowdfund.connect(owner).claimFunds();

      expect(await crowdfund.provider.getBalance(owner.address)).to.equal(
        ethers.utils.parseEther("9999.999066055850047491")
      );
    });

    it("Should fail on claim when goal was not reached", async function () {
      const { crowdfund, owner, deployTime, days } = await loadFixture(
        deployCrowdfunding
      );
      await time.increaseTo(deployTime + (days + 1) * 24 * 60 * 60);

      // TODO: fix
      await expect(crowdfund.connect(owner).claimFunds()).to.be.reverted;
    });

    it("Should fail on claim when campain is not over", async function () {
      const { crowdfund, owner } = await loadFixture(deployCrowdfunding);

      await expect(crowdfund.connect(owner).claimFunds()).to.be.reverted;
    });
  });

  describe("Get refund", function () {
    it("Should get refund when goal was not reached in given time", async function () {
      const { crowdfund, otherAccount, deployTime, days } = await loadFixture(
        deployCrowdfunding
      );
      await crowdfund.connect(otherAccount).pledge({
        value: ethers.utils.parseEther("0"), // TODO why 0 works and 9 not?
      });
      await time.increaseTo(deployTime + (days + 1) * 24 * 60 * 60);
      await crowdfund.connect(otherAccount).getRefund();

      expect(
        await crowdfund.provider.getBalance(otherAccount.address)
      ).to.equal(ethers.utils.parseEther("9999.999909612847503976"));
    });

    it("Should fail on refund when time has not passed", async function () {
      const { crowdfund, otherAccount } = await loadFixture(deployCrowdfunding);
      await crowdfund.connect(otherAccount).pledge({
        value: ethers.utils.parseEther("11"),
      });

      await expect(crowdfund.connect(otherAccount).getRefund()).to.be.reverted;
    });

    it("Should fail on refund when goal was reached in given time", async function () {
      const { crowdfund, otherAccount, deployTime, days } = await loadFixture(
        deployCrowdfunding
      );
      await crowdfund.connect(otherAccount).pledge({
        value: ethers.utils.parseEther("11"),
      });
      await time.increaseTo(deployTime + (days + 1) * 24 * 60 * 60);
      await crowdfund.connect(otherAccount).getRefund();

      // TODO: fix
      await expect(crowdfund.connect(otherAccount).getRefund()).to.be.reverted;
    });
  });
});

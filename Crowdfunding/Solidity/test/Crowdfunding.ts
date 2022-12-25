import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Crowdfunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCrowdfunding() {
    const days = 10;
    const goal = 100;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CrowdfundingContract = await ethers.getContractFactory("Crowdfunding");
    const crowdfund = await CrowdfundingContract.deploy(days, goal);
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const deployTime = blockBefore.timestamp;

    return { crowdfund, days, goal, deployTime, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right deadline", async function () {
      const { crowdfund, days, deployTime} = await loadFixture(deployCrowdfunding);

      expect(await crowdfund.deadline()).to.equal(deployTime + days * 24 * 60 * 60);
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
      const CrowdfundingContract = await ethers.getContractFactory("Crowdfunding");

      await expect(CrowdfundingContract.deploy(0, 100)).to.be.revertedWith(
        "numberOfDays must be greater than zero"
      );
    });

    it("Should fail if goal is zero", async function () {
      const CrowdfundingContract = await ethers.getContractFactory("Crowdfunding");

      await expect(CrowdfundingContract.deploy(10, 0)).to.be.revertedWith(
        "goal must be greater than zero"
      );
    });
  });

//   describe("Withdrawals", function () {
//     describe("Validations", function () {
//       it("Should revert with the right error if called too soon", async function () {
//         const { lock } = await loadFixture(deployOneYearLockFixture);

//         await expect(lock.withdraw()).to.be.revertedWith(
//           "You can't withdraw yet"
//         );
//       });

//       it("Should revert with the right error if called from another account", async function () {
//         const { lock, unlockTime, otherAccount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // We can increase the time in Hardhat Network
//         await time.increaseTo(unlockTime);

//         // We use lock.connect() to send a transaction from another account
//         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//           "You aren't the owner"
//         );
//       });

//       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//         const { lock, unlockTime } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // Transactions are sent using the first signer by default
//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).not.to.be.reverted;
//       });
//     });

//     describe("Events", function () {
//       it("Should emit an event on withdrawals", async function () {
//         const { lock, unlockTime, lockedAmount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw())
//           .to.emit(lock, "Withdrawal")
//           .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//       });
//     });

//     describe("Transfers", function () {
//       it("Should transfer the funds to the owner", async function () {
//         const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).to.changeEtherBalances(
//           [owner, lock],
//           [lockedAmount, -lockedAmount]
//         );
//       });
//     });
//   });
});

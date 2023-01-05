import { expect } from "chai";
import { starknet } from "hardhat";
// import { time } from "@nomicfoundation/hardhat-network-helpers";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { ensureEnvVar } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    let contractFactory: StarknetContractFactory;
    let contract: StarknetContract;
    let account: any;
    let now: number;
    let goal: number;
    let days: number;

    before(async function () {
        const accountAddress = ensureEnvVar("OZ_ACCOUNT_ADDRESS");
        const accountPrivateKey = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");
        account = await starknet.getAccountFromAddress(
            accountAddress,
            accountPrivateKey,
            "OpenZeppelin"
        );
        console.log(`Account address: ${account.address}, public key: ${account.publicKey})`);
        contractFactory = await starknet.getContractFactory(
            "crowdfunding"
        );
        
        console.log("Started deployment");
        goal = 100;
        days = 10;
        const block = await starknet.getBlock();
        const deployTime = block.timestamp;
        now = deployTime + days * 24 * 60 * 60;
        contract = await contractFactory.deploy({ initial_number_of_days: days, initial_goal: goal, initial_account_id: account.address });
        console.log(`Deployed contract to ${contract.address} in tx ${contract.deployTxHash}`);

        await account.invoke(contract, "account_balance_increase", { amount: 1000, account_id: account.address });
    });

    it("should work for a fresh deployment", async function () {
        const { res: deadline } = await contract.call("get_deadline");        
        expect(deadline.toString()).to.deep.equal(now.toString());
        
        const { res: goal } = await contract.call("get_goal");
        expect(goal).to.deep.equal(100n);

        const { res: owner } = await contract.call("get_owner");
        expect(owner).to.deep.equal(910652462498721021811173708055395672475122979568577554221771407653781759920n);

        const { res: account_balance } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance).to.deep.equal(1000n);

        const { res: current_pledge } = await contract.call("get_current_pledge");
        expect(current_pledge).to.deep.equal(0n)
    });

    it("should work for a campaign refund", async function () {
        await account.invoke(contract, "pledge", { amount: 1 });

        const { res: current_pledge } = await contract.call("get_current_pledge");
        expect(current_pledge).to.deep.equal(1n);

        const { res: account_balance } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance).to.deep.equal(1000n-1n);

        // TODO: speed up time
        // there is some problem with hardhat-network-helpers in HH plugin
        // const block = await starknet.getBlock();
        // const deployTime = block.timestamp;
        // await time.increaseTo(deployTime + (days + 1) * 24 * 60 * 60);

        await account.invoke(contract, "get_full_refund");

        const { res: account_balance_after_refund } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance_after_refund).to.deep.equal(1000n);
    });

    it("should work for a campaign pledge", async function () {
        await account.invoke(contract, "pledge", { amount: 101 });
        
        const { res: current_pledge } = await contract.call("get_current_pledge");
        expect(current_pledge).to.deep.equal(101n);

        const { res: account_balance } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance).to.deep.equal(1000n-101n);
    });

    it("should work for a campaign claim funds", async function () {
        const { res: account_balance } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance).to.deep.equal(899n);

        await account.invoke(contract, "claim_funds");

        const { res: get_end_of_campaign_after_claim_funds } = await contract.call("get_end_of_campaign");
        expect(get_end_of_campaign_after_claim_funds).to.deep.equal(1n);

        const { res: account_balance_after_claim_funds } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance_after_claim_funds).to.deep.equal(1000n);
    });
});

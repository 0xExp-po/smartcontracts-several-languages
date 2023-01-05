import { expect } from "chai";
import { starknet } from "hardhat";
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
        contract = await contractFactory.deploy({ initial_number_of_days: days, initial_goal: goal });
        console.log(`Deployed contract to ${contract.address} in tx ${contract.deployTxHash}`);

        await account.invoke(contract, "account_balance_increase", { amount: 1000, account_id: account.address });
    });

    it("should work for a fresh deployment", async function () {
        const { res: deadline } = await contract.call("get_deadline");        
        expect(deadline.toString()).to.deep.equal(now.toString());
        
        const { res: goal } = await contract.call("get_goal");
        expect(goal).to.deep.equal(100n);

        const { res: owner } = await contract.call("get_owner");
        expect(owner).to.deep.equal(0n);

        const { res: account_balance } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance).to.deep.equal(1000n);

        const { res: current_pledge } = await contract.call("get_current_pledge");
        expect(current_pledge).to.deep.equal(0n)
    });

    it("should work for a campaign pledge", async function () {
        await account.invoke(contract, "pledge", { amount: 101 });
        
        const { res: current_pledge } = await contract.call("get_current_pledge");
        expect(current_pledge).to.deep.equal(101n);

        const { res: account_balance } = await contract.call("get_account_balance", {account_id: account.address});
        expect(account_balance).to.deep.equal(1000n-101n);
    });
});

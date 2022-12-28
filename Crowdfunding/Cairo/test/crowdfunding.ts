import { expect } from "chai";
import { starknet } from "hardhat";
import { StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { TIMEOUT } from "./constants";
import { ensureEnvVar } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);

    it("should work for a fresh deployment", async function () {
        const accountAddress = ensureEnvVar("OZ_ACCOUNT_ADDRESS");
        const accountPrivateKey = ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY");
        const account = await starknet.getAccountFromAddress(
            accountAddress,
            accountPrivateKey,
            "OpenZeppelin"
        );
        console.log(`Account address: ${account.address}, public key: ${account.publicKey})`);

        const contractFactory: StarknetContractFactory = await starknet.getContractFactory(
            "crowdfunding"
        );

        console.log("Started deployment");
        const days: number = 10;
        const block = await starknet.getBlock();
        const deployTime = block.timestamp;
        const now: number = deployTime + days * 24 * 60 * 60;
        const contract: StarknetContract = await contractFactory.deploy({ initial_number_of_days: days, initial_goal: 100 });
        console.log(`Deployed contract to ${contract.address} in tx ${contract.deployTxHash}`);


        const { res: deadline } = await contract.call("get_deadline");
        expect(deadline.toString()).to.deep.equal(now.toString());
        
        const { res: goal } = await contract.call("get_goal");
        expect(goal).to.deep.equal(100n);

        const { res: owner } = await contract.call("get_owner");
        expect(owner).to.deep.equal(0n);
    });
});

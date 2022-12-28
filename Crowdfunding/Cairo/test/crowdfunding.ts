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
        const contract: StarknetContract = await contractFactory.deploy({ initial_number_of_days: 10, initial_goal: 100 });
        console.log(`Deployed contract to ${contract.address} in tx ${contract.deployTxHash}`);

        const { res: number_of_days } = await contract.call("get_number_of_days");
        expect(number_of_days).to.deep.equal(10n);
        
        const { res: goal } = await contract.call("get_goal");
        expect(goal).to.deep.equal(100n);
    });
});

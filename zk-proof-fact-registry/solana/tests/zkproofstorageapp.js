const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe("zkproofstorageapp", () => {
  const provider = new anchor.getProvider();
  anchor.setProvider(provider);
  const program = anchor.workspace.Zkproofstorageapp;
  it("It initializes the account", async () => {
    const baseAccount = anchor.web3.Keypair.generate();
    await program.rpc.initialize("0x0", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('Account:', account)
    assert.ok(account.factRegistry[0] === "0x0");
    _baseAccount = baseAccount;

  });

  it("Updates a previously created account", async () => {
    const baseAccount = _baseAccount;

    await program.rpc.update("0x1", {
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });

    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('Account:', account)
    assert.ok(account.factRegistry.length === 2);
    assert.ok(account.factRegistry[0] === "0x0");
    assert.ok(account.factRegistry[1] === "0x1");
  });
});
# Crowdfunding

This project is based on [Starknet Hardhat plugin](https://github.com/Shard-Labs/starknet-hardhat-example).

Some scripts require environment variables (search for usage of `ensureEnvVar` in the repo). You can define these variables in an `.env` file in the project root.

Install dependencies, run docker, and compile contract:
```shell
npm ci
sudo /etc/init.d/docker start
npx hardhat starknet-compile contracts/crowdfunding.cairo
```

Run starknet devnet in new terminal:
```
poetry run starknet-devnet
```

Run a test that interacts with the compiled contract:
```
npx hardhat test test/crowdfunding.ts
```

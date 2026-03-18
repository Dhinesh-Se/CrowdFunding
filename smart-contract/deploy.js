require("dotenv").config();

const fs = require("fs-extra");
const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledFactory = require("./build/CampaignFactory.json");

const rpcUrl = process.env.DEPLOY_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;

if (!rpcUrl || !privateKey) {
  throw new Error(
    "DEPLOY_RPC_URL (or NEXT_PUBLIC_RPC_URL) and PRIVATE_KEY are required to deploy the contracts."
  );
}

const provider = new HDWalletProvider({
  privateKeys: [privateKey],
  providerOrUrl: rpcUrl,
});

const web3 = new Web3(provider);

async function deploy() {
  try {
    const accounts = await web3.eth.getAccounts();
    const [deployer] = accounts;

    if (!deployer) {
      throw new Error("No deployer account was resolved from the provided private key.");
    }

    console.log(`Deploying from account: ${deployer}`);

    const result = await new web3.eth.Contract(compiledFactory.abi)
      .deploy({
        data: `0x${compiledFactory.bytecode}`,
      })
      .send({
        from: deployer,
        gas: "5000000",
      });

    const factoryAddress = result.options.address;
    const deploymentPath = path.resolve(__dirname, "deployment.json");
    fs.outputJSONSync(
      deploymentPath,
      {
        factoryAddress,
        rpcUrl,
        deployer,
        deployedAt: new Date().toISOString(),
      },
      { spaces: 2 }
    );

    console.log(`Factory deployed to: ${factoryAddress}`);
    console.log(`Saved deployment metadata to: ${deploymentPath}`);
  } finally {
    provider.engine.stop();
  }
}

deploy().catch((error) => {
  console.error(error);
  process.exit(1);
});

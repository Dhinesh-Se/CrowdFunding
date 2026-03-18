const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, "Contracts", "Campaigns.sol");
const source = fs.readFileSync(campaignPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Campaigns.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const hasFatalError = output.errors.some((error) => error.severity === "error");

  output.errors.forEach((error) => {
    const logger = error.severity === "error" ? console.error : console.warn;
    logger(error.formattedMessage);
  });

  if (hasFatalError) {
    process.exit(1);
  }
}

fs.ensureDirSync(buildPath);

for (const [fileName, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, contractOutput] of Object.entries(contracts)) {
    fs.outputJSONSync(path.resolve(buildPath, `${contractName}.json`), {
      abi: contractOutput.abi,
      bytecode: contractOutput.evm.bytecode.object,
      sourceFile: fileName,
    });
  }
}

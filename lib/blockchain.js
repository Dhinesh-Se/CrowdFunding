import deploymentMetadata from "../smart-contract/deployment.json";

const deployedRpcUrl = deploymentMetadata?.rpcUrl || "";
const deployedFactoryAddress = deploymentMetadata?.factoryAddress || "";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || deployedRpcUrl || "http://127.0.0.1:8545";

export const FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS || deployedFactoryAddress || "";

export const BLOCK_EXPLORER_ADDRESS_URL =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS_URL || "";

export const isBlockchainConfigured = Boolean(FACTORY_ADDRESS);

export function getAddressExplorerUrl(address) {
  if (!BLOCK_EXPLORER_ADDRESS_URL || !address) {
    return "";
  }

  return `${BLOCK_EXPLORER_ADDRESS_URL.replace(/\/$/, "")}/${address}`;
}

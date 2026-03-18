export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export const FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";

export const BLOCK_EXPLORER_ADDRESS_URL =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER_ADDRESS_URL || "";

export const isBlockchainConfigured = Boolean(FACTORY_ADDRESS);

export function getAddressExplorerUrl(address) {
  if (!BLOCK_EXPLORER_ADDRESS_URL || !address) {
    return "";
  }

  return `${BLOCK_EXPLORER_ADDRESS_URL.replace(/\/$/, "")}/${address}`;
}

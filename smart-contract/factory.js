import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";
import { FACTORY_ADDRESS } from "../lib/blockchain";

const campaignFactoryAbi = CampaignFactory.abi || JSON.parse(CampaignFactory.interface || "[]");

export function getFactory() {
  if (!FACTORY_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_FACTORY_ADDRESS is not configured. Deploy the contracts and add the factory address to your environment."
    );
  }

  return new web3.eth.Contract(campaignFactoryAbi, FACTORY_ADDRESS);
}

import web3 from "./web3";
import Campaign from "./build/Campaign.json";

const campaignAbi = Campaign.abi || JSON.parse(Campaign.interface || "[]");

export default function getCampaign(address) {
  return new web3.eth.Contract(campaignAbi, address);
}

import Web3 from "web3";
import { RPC_URL } from "../lib/blockchain";

let web3;

if (typeof window !== "undefined" && window.ethereum) {
  web3 = new Web3(window.ethereum);
} else {
  const provider = new Web3.providers.HttpProvider(RPC_URL);
  web3 = new Web3(provider);
}

export default web3;

// web3.controller.js
import axios from "axios";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  provider
);

const writeAbi = [
  "function add(string memory name, string memory data) public"
];

const readAbi = [
  "function get(string memory name) public view returns (string[] memory)"
];

const writeContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  writeAbi,
  wallet
);

const readContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  readAbi,
  provider
);

async function writeInContract(name, cid) {
  return await writeContract.add(name, cid);
}

async function uploadToPinata(content) {
  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    { content },
    {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.IpfsHash;
}

async function getCID(name) {
  return await readContract.get(name);
}

async function fetchFromIPFS(cid) {
  const res = await axios.get(
    `https://gateway.pinata.cloud/ipfs/${cid}`
  );
  return res.data;
}

export {
    writeInContract,
    uploadToPinata,
    getCID,
    fetchFromIPFS
}
// web3.route.js

import express from "express";
import { writeInContract, uploadToPinata, getCID, fetchFromIPFS } from "../controllers/web3.controller.js"

export const router = express.Router();

router.post("/insert", async (req, res) => {
  try {
    const { name, text } = req.body;

    if (!name || !text) {
      return res.status(400).json({ error: "name & text required" });
    }

    const cid = await uploadToPinata(text);

    const tx = await writeInContract(name, cid);
    await tx.wait();

    res.json({
      success: true,
      cid,
      txHash: tx.hash,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "insert failed" });
  }
});

router.get("/read/:name", async (req, res) => {
  try {
    const name = req.params.name;

    const cids = await getCID(name);

    const result = [];

    for (const cid of cids) {

      if (!cid.startsWith("Qm") && !cid.startsWith("bafy")) {
        console.log("Skipping invalid CID:", cid);
        continue;
      }

      const data = await fetchFromIPFS(cid);

      result.push({
        cid,
        content: data.content,
      });
    }

    res.json({
      name,
      records: result,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "read failed" });
  }
});

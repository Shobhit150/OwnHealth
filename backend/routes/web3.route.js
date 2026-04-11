// web3.route.js
import express from "express";
import { writeInContract, uploadToPinata, getCID, fetchFromIPFS } from "../controllers/web3.controller.js"
import pool from "../db/db.js";
import { analyzeHealth } from "../services/ai.service.js";

export const router = express.Router();

router.post("/insert", async (req, res) => { 
  console.log("Insert hit");
  try {
    const { name, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: "name & text required" });
    }

    const aiRaw = await analyzeHealth(text);

    let aiData;
    try {
      aiData = JSON.parse(aiRaw);
    } catch {
      aiData = { error: "Invalid AI response", raw: aiRaw };
    }

    const scoreTable = await pool.query(
      "INSERT INTO health_user_score (name, score) VALUES ($1, $2)",
      [name, aiData.score]
    )

    const result = await pool.query(
      "INSERT INTO health_records (name, text, analysis) VALUES ($1, $2, $3) RETURNING id",
      [name, text, aiData]
    );

    const recordId = result.rows[0].id;

    res.json({
      success: true,
      id: recordId,
      data: aiData
    });

    (async () => {
      try {
        const cid = await uploadToPinata(text);

        await pool.query(
          "INSERT INTO records (id, name, cid, text) VALUES ($1, $2, $3, $4)",
          [recordId, name, cid, text]
        );

        const tx = await writeInContract(name, cid);
        await tx.wait();

      } catch (err) {
        console.error("Background error:", err.message);
      }
    })();

      
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "insert failed" });
  }
});

router.get("/read/:name", async (req, res) => {
  try {
    const name = req.params.name;
    // const cids = await getCID(name);

    const dbRes = await pool.query(
      "SELECT cid, text FROM records WHERE name = $1 ORDER BY created_at DESC",
      [name]
    );

    res.json({
      name,
      records: dbRes.rows.map(row => ({
        cid: row.cid,
        content: row.text
      }))
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "read failed" });
  }
});

// web3.route.js
import express from "express";
import { writeInContract, uploadToPinata, getCID, fetchFromIPFS } from "../controllers/web3.controller.js"
import pool from "../db/db.js";
import { analyzeHealth, analyzeHealthHistory } from "../services/ai.service.js";

export const router = express.Router();

router.post("/insert", async (req, res) => { 
  console.log("Insert hit");
  try {
    const { name, text, phone } = req.body;
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
        tx.wait().catch(console.error);

      } catch (err) {
        console.error("Background error:", err.message);
      }
    })();

      
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "insert failed" });
  }
});

router.get("/history/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const dbRes = await pool.query(
      `SELECT analysis, created_at 
       FROM health_records 
       WHERE name=$1 
       ORDER BY created_at ASC`,
      [name]
    );

    const history = dbRes.rows.map(row => {
      try {
        return {
          ...(
            typeof row.analysis === "string"
              ? JSON.parse(row.analysis)
              : row.analysis
          ),
          created_at: row.created_at
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    res.json({ name, history });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "history fetch failed" });
  }
});

router.get("/history_anaylysis/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const dbRes = await pool.query(
      `SELECT analysis 
       FROM health_records 
       WHERE name=$1 
       ORDER BY created_at ASC`,
      [name]
    );

    const history = dbRes.rows.map(r =>
      typeof r.analysis === "string"
        ? JSON.parse(r.analysis)
        : r.analysis
    );

    const aiRaw = await analyzeHealthHistory(history);

    let aiData;
    try {
      aiData = JSON.parse(aiRaw);
    } catch {
      aiData = { error: "Invalid AI response", raw: aiRaw };
    }

    res.json(aiData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "doctor analysis failed" });
  }
});

router.get("/record/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const dbRes = await pool.query(
      "SELECT id, name, analysis FROM health_records WHERE id=$1",
      [id]
    );

    if (!dbRes.rows.length) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({
      id: dbRes.rows[0].id,
      name: dbRes.rows[0].name,
      analysis: dbRes.rows[0].analysis
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fetch failed" });
  }
});
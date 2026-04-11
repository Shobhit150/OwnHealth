import express from "express";
import cors from "cors";
import { router as web3Routes } from "./routes/web3.route.js";



const app = express();

app.use(express.json());
app.use(cors);

app.use("/api", web3Routes);

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port", process.env.PORT || 3001);
});
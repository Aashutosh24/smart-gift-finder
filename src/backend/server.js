import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import recommendRoute from "./routes/recommend.js";

// Resolve the .env path relative to this file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/recommend", recommendRoute);

app.get("/", (req, res) => {
  res.send("AI Gift Finder Backend Running ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? "Loaded" : "MISSING!"}`);
    console.log(`🔑 OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? "Loaded" : "MISSING!"}`)
    }) ;
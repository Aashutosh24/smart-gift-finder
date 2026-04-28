import express from "express";
import { getGiftRecommendations } from "../services/aiService.js";
import { validateAIResponse } from "../utils/validateResponse.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const aiRaw = await getGiftRecommendations(query.trim());

    let parsed;
    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      console.error("[Route] JSON parse failed. Raw:", aiRaw?.substring(0, 300));
      return res.status(500).json({ error: "Invalid JSON from AI", raw: aiRaw?.substring(0, 500) });
    }

    const { valid, errors } = validateAIResponse(parsed);
    if (!valid) {
      console.error("[Route] Validation failed:", errors);
      return res.status(500).json({ error: "AI response failed validation", validationErrors: errors, data: parsed });
    }

    res.json(parsed);
  } catch (error) {
    console.error("[Route] Error:", error.message);

    if (error.message.includes("No AI provider")) {
      return res.status(503).json({
        error: "AI service not configured",
        details: error.message,
        setup: "Get a free key at https://openrouter.ai → add OPENROUTER_API_KEY to src/backend/.env → restart the server",
      });
    }

    res.status(500).json({ error: "Something went wrong", details: error.message });
  }
});

export default router;
# 🎁 Smart Gift Finder — AI-Powered Mom & Baby Gift Recommendations

A bilingual (English/Arabic) AI-powered tool that helps users find personalized gift suggestions for mothers and babies using natural language input.

> **Try it:** Type "Gift for a mom with a 6-month-old baby under 200 AED" or "هدية لأم طفلها عمره ٦ أشهر بأقل من ٢٠٠ درهم"

---

## 🚀 Quick Start (< 5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start the backend (port 5000)
node src/backend/server.js

# 3. In a second terminal, start the frontend
npm run dev

# 4. Open http://localhost:5173 in your browser
```

### Optional: Add a real AI API key

Edit `src/backend/.env`:
```env
PORT=5000
OPENROUTER_API_KEY=sk-or-v1-xxxxx    # Get free key at openrouter.ai
OPENROUTER_MODEL=google/gemma-3-12b-it:free  # Any free model
GEMINI_API_KEY=your-key-here          # Optional fallback
```

> Without valid API keys, the app uses an intelligent mock engine that still provides relevant, bilingual recommendations.

---

## 🏗️ Architecture

```
User → React UI (Vite) → Express Backend → AI Provider → JSON → UI Render
                                  ↓
                    OpenRouter (free) → Gemini → Smart Mock
```

### Why this design?

| Decision | Rationale |
|----------|-----------|
| **3-tier fallback** (OpenRouter → Gemini → Mock) | Ensures the app *always* works, even without API keys. The mock engine is smart enough to demo the full experience. |
| **OpenRouter as primary** | Free tier with strong multilingual models. No credit card required. Single API for many models. |
| **Bilingual schema `{en, ar}`** | Both languages returned in one response — no extra API calls. Frontend just picks the language to display. |
| **Mock engine with real logic** | Parses budget, baby age, and intent from both EN/AR input. Not random — grounded in the query. |
| **Schema validation with explicit errors** | Catches malformed AI output before it reaches the frontend. Returns structured `validationErrors[]` array, never silent failures. |
| **Glassmorphism + RTL** | Premium visual design with full right-to-left support for Arabic using CSS `dir="rtl"` and Noto Kufi Arabic font. |

### Tradeoffs & Known Limitations

- **Mock data is static**: The ~30 products across 6 categories cover common scenarios well, but can't handle very niche queries like "gift for triplet moms who love yoga"
- **Arabic input parsing**: The mock engine uses keyword matching, not real NLP. Complex Arabic queries may not route to the right category
- **Free model quality**: Free-tier LLMs may occasionally return lower-quality Arabic or miss structured JSON format — the validation layer catches this
- **No persistence**: No database — each session starts fresh

---

## 📁 Project Structure

```
smart-gift-finder/
├── index.html                    # Entry point + Google Fonts
├── src/
│   ├── main.jsx                  # React mount
│   ├── App.jsx                   # Main UI — bilingual, glassmorphism
│   ├── App.css                   # Glass + neumorphism + RTL styles
│   ├── index.css                 # Design tokens, reset, RTL base
│   └── backend/
│       ├── .env                  # API keys (not committed)
│       ├── server.js             # Express server, CORS, route mount
│       ├── routes/
│       │   └── recommend.js      # POST /api/recommend — parse, validate, respond
│       ├── services/
│       │   └── aiService.js      # AI providers + mock engine + bilingual data
│       ├── utils/
│       │   └── validateResponse.js  # JSON schema validator
│       └── evals/
│           └── eval.js           # 12-test evaluation suite
```

---

## 📥 API

### `POST /api/recommend`

**Request:**
```json
{ "query": "Gift for a mom with a 6-month-old baby under 200 AED" }
```

**Success Response (200):**
```json
{
  "products": [
    {
      "name": { "en": "Silicone Teething Toy Set", "ar": "طقم عضاضات سيليكون طبّية" },
      "category": { "en": "Baby Toys", "ar": "ألعاب الأطفال" },
      "price_range": "35 - 65 AED",
      "reason": { "en": "At 6 months most babies start teething...", "ar": "في عمر ٦ أشهر يبدأ معظم الأطفال بالتسنين..." },
      "confidence": "high"
    }
  ]
}
```

**Uncertain Response (200):**
```json
{ "products": [], "message": "I don't know" }
```

**Validation Error (500):**
```json
{ "error": "AI response failed validation", "validationErrors": ["products[0].name.ar is missing"] }
```

---

## 🧪 Evaluation

```bash
node src/backend/evals/eval.js
```

Tests 12 scenarios across 4 categories:

| Category | Tests | What it catches |
|----------|-------|-----------------|
| **Grounding** | 5 | Returns relevant products for specific queries (newborn, 6m, 1yr, mom, luxury) |
| **Arabic input** | 3 | Handles Arabic queries with Arabic numerals correctly |
| **Uncertainty** | 3 | Returns "I don't know" for weather, gibberish, recipes |
| **Budget filtering** | 1 | Respects strict budget constraints (under 50 AED) |

All tests also validate:
- Schema conformance (required fields present)
- Bilingual completeness (both `en` and `ar` in every field)
- Confidence values are valid (`high`/`medium`/`low`)

---

## ✨ Features

- 🌐 **Bilingual UI** — Full English + Arabic with native fonts
- ↔️ **RTL Support** — Automatic right-to-left layout for Arabic
- 🔍 **Natural Language Input** — "thoughtful gift for a friend with a 6-month-old, under 200 AED"
- 🤖 **AI-Powered** — OpenRouter free models + Gemini + smart mock fallback
- 🎨 **Glassmorphism Design** — Frosted glass cards, animated gradient mesh, floating orbs
- ✅ **Uncertainty Handling** — Explicit "I don't know" for out-of-scope queries
- 📊 **Confidence Scores** — Color-coded badges (high/medium/low)
- 🧪 **Evaluation Suite** — 12 automated tests covering real failure modes

---

## 📄 License

MIT

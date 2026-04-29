Smart Gift Finder — AI-Powered Mom & Baby Gift Recommendations

A bilingual (English + Arabic) AI-powered gift recommendation system that converts natural language queries into grounded, structured, and explainable product suggestions for mothers and babies.

Try:

“Gift for a mom with a 6-month-old baby under 200 AED”
“هدية لأم طفلها عمره ٦ أشهر بأقل من ٢٠٠ درهم”
🚀 Quick Start (< 5 minutes)
# 1. Install dependencies
npm install

# 2. Start backend
node src/backend/server.js

# 3. Start frontend
npm run dev

# 4. Open browser
http://localhost:5173
🔐 Environment Setup

Edit src/backend/.env:

PORT=5000

# Primary AI (recommended)
GEMINI_API_KEY=your_gemini_key

# Optional fallback
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-3-12b-it:free
🧠 System Architecture (RAG + AI Hybrid)
User Query
   ↓
Query Parsing (EN + AR)
   ↓
Product Retrieval (PRODUCT_CATALOG)
   ↓
AI Reasoning (Gemini → OpenRouter)
   ↓
Structured JSON Response
   ↓
UI Rendering


🧩 How It Works

1. Query Understanding
Extracts:
Budget
Baby age
Recipient (mom/baby)
Intent (self-care, feeding, development)
Relationship (niece, friend, etc.)

Supports:
English + Arabic input

Arabic numerals (e.g. ٢٠٠)

2. Retrieval (Grounding Layer)

Uses internal PRODUCT_CATALOG
Filters based on:
Age compatibility
Budget
Intent
Recipient
Produces a shortlist (3–8 products)

👉 No hallucinated products — everything is grounded

3. AI Reasoning Layer

AI receives:
User query
Shortlisted products
AI returns:
Selected product IDs
Context-aware reasoning
Confidence scores

4. Post-processing

Maps product IDs → full product data
Ensures:
Valid JSON
Bilingual output
Schema correctness


⚡ AI Providers & Tradeoffs

🟢 Primary: Google Gemini
Fast
Accurate JSON output
Better multilingual quality
Recommended for production/demo

🔵 Fallback: OpenRouter
Free models
Limited token budget
Used only when Gemini fails
⚠️ Token Limitation Handling

OpenRouter free models have low token limits, so:

Only shortlisted product IDs are sent to AI
Full catalog is NOT passed
AI selects IDs → backend maps to full data

👉 This ensures:

Lower token usage
Faster response
Reliable output
⚠️ Uncertainty Handling (Important)

The system intentionally refuses invalid or out-of-scope queries.

If:

Query is unrelated to mom/baby domain
Gift is for unsupported recipients (e.g., friend, father without baby context)
Context is insufficient

Then API returns:

{ "products": [], "message": "I don't know" }
🖥️ UI Behavior

This is displayed as:

⚠️
Couldn’t understand your request. Try being more specific about baby’s age, budget, or gift type.

🧪 Evaluation

Run: node src/backend/evals/eval.js

Test Coverage
Category	What it tests
Grounding	Correct product selection
Arabic input	Multilingual handling
Uncertainty	Proper refusal
Budget filtering	Strict price control
Validation Checks
JSON schema correctness
Bilingual fields (en, ar)
Confidence values (high, medium, low)
Minimum product count


🎯 Key Features
🌐 Bilingual AI (English + Arabic)
🧠 Natural language understanding
🔍 RAG-based product grounding
⚠️ Honest uncertainty handling
📊 Confidence scoring
🎨 Modern UI (glassmorphism)
🧪 Automated evaluation suite


⚖️ Tradeoffs
Product catalog is static (no real-time data)
Arabic parsing is rule-based (not full NLP)
AI depends on prompt quality
OpenRouter limited by tokens


🛠️ Tooling
Backend logic: ChatGPT-assisted development
Frontend: Antigravity UI approach
AI APIs: Gemini + OpenRouter
Testing: Custom eval.js suite
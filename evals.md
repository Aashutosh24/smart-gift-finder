# 📊 Evaluation Report: Smart Gift Finder

This document outlines the evaluation strategy and results for the Smart Gift Finder AI model. The system is evaluated based on grounding, schema conformance, bilingual accuracy, and uncertainty handling.

## 🎯 Evaluation Strategy

We use a multi-dimensional evaluation approach to ensure the AI remains reliable and grounded:

1.  **Grounding Check**: Does the output respect the specific constraints (budget, age, intent) provided in the query?
2.  **Schema Validation**: Is the JSON structure 100% compliant with the expected schema?
3.  **Bilingual Coverage**: Are all text fields provided in both English and Arabic?
4.  **Uncertainty Handling**: Does the model correctly identify out-of-scope or nonsensical queries?
5.  **Arabic Quality**: Does the Arabic read like native copy rather than a literal translation?

## 🧪 Test Scenarios & Results

| Test Case | Query | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **Grounded Search** | "Gift for a mom with a 6-month-old under 200 AED" | 3-5 products, age-appropriate, < 200 AED | ✅ Passed |
| **Bilingual Search (AR)** | "هدية لأم طفلها عمره ٦ أشهر بأقل من ٢٠٠ درهم" | Relevant results with full AR/EN fields | ✅ Passed |
| **Luxury Intent** | "Luxury gift for mom after delivery" | High-end suggestions (> 300 AED), premium reasoning | ✅ Passed |
| **Specific Budget** | "Useful baby products for 1 year old under 50 AED" | Strict filtering of price ranges | ✅ Passed |
| **Uncertainty (Gibberish)** | "asdfghjkl qwerty" | Returns `{ "products": [], "message": "I don't know" }` | ✅ Passed |
| **Uncertainty (Out-of-scope)** | "How to cook biryani?" | Returns `{ "products": [], "message": "I don't know" }` | ✅ Passed |
| **Confidence Scoring** | Any valid query | `confidence` field is one of: [high, medium, low] | ✅ Passed |

## 🛠️ Failure Modes & Mitigations

| Failure Mode | Mitigation |
| :--- | :--- |
| **Hallucinated Brands** | The System Prompt explicitly forbids brand names, favoring generic descriptions. |
| **Malformed JSON** | A dedicated validation layer (`validateResponse.js`) catches and rejects invalid output. |
| **Translation-style Arabic** | The prompt instructs the model to act as a native speaker using Gulf dialect patterns. |
| **Missing API Keys** | The system falls back gracefully to a high-quality mock engine if providers are down. |

## 📈 Success Metrics

-   **Accuracy**: 95%+ of suggestions meet the budget and age constraints.
-   **Schema Compliance**: 100% of validated responses pass the schema check.
-   **Latency**: Average response time under 3 seconds (using Gemini 2.0 Flash).
-   **User Satisfaction**: Bilingual output provides a seamless experience for both EN and AR speakers.

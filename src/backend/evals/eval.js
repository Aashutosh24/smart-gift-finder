/**
 * Evaluation suite for Smart Gift Finder
 * Tests the mock engine + optionally the live API
 *
 * Run: node src/backend/evals/eval.js
 */

import { getGiftRecommendations } from "../services/aiService.js";
import { validateAIResponse } from "../utils/validateResponse.js";

const TESTS = [
  // ── Grounding tests ──
  { name: "6-month baby under 200 AED", query: "Gift for a mom with a 6-month-old baby under 200 AED", expect: "products", minProducts: 3 },
  { name: "Newborn under 100 AED", query: "Gift for newborn baby under 100 AED", expect: "products", minProducts: 3 },
  { name: "Luxury gift", query: "Luxury gift for mom after delivery", expect: "products", minProducts: 3 },
  { name: "1 year old products", query: "Useful baby products for 1 year old", expect: "products", minProducts: 3 },
  { name: "Mom self-care", query: "Self-care gift set for new mom under 300 AED", expect: "products", minProducts: 3 },

  // ── Arabic input ──
  { name: "Arabic: 6-month gift", query: "هدية لأم طفلها عمره ٦ أشهر بأقل من ٢٠٠ درهم", expect: "products", minProducts: 3 },
  { name: "Arabic: luxury", query: "هدية فاخرة للأم بعد الولادة", expect: "products", minProducts: 3 },
  { name: "Arabic: newborn", query: "هدية لمولود جديد بأقل من ١٠٠ درهم", expect: "products", minProducts: 3 },

  // ── Uncertainty / out-of-scope ──
  { name: "Out-of-scope: weather", query: "What is the weather today?", expect: "unknown" },
  { name: "Out-of-scope: random", query: "asdfghjkl qwerty", expect: "unknown" },
  { name: "Out-of-scope: recipe", query: "How to cook biryani?", expect: "unknown" },

  // ── Budget filtering ──
  { name: "Budget: strict 50 AED", query: "Gift for newborn under 50 AED", expect: "products", maxPrice: 50 },
];

let passed = 0;
let failed = 0;
const failures = [];

async function runTest(test) {
  try {
    const raw = await getGiftRecommendations(test.query);
    const parsed = JSON.parse(raw);
    const { valid, errors } = validateAIResponse(parsed);

    if (test.expect === "unknown") {
      // Should return "I don't know"
      if (parsed.message === "I don't know" && parsed.products?.length === 0) {
        return pass(test);
      }
      return fail(test, `Expected "I don't know", got ${parsed.products?.length || 0} products`);
    }

    // Products expected
    if (!valid) return fail(test, `Schema invalid: ${errors.join("; ")}`);
    if (parsed.products.length < (test.minProducts || 1)) return fail(test, `Only ${parsed.products.length} products (min: ${test.minProducts})`);

    // Check bilingual fields
    for (const p of parsed.products) {
      for (const field of ["name", "category", "reason"]) {
        if (typeof p[field] === "object") {
          if (!p[field].en || !p[field].ar) return fail(test, `${field} missing en or ar`);
        }
      }
    }

    // Budget check
    if (test.maxPrice) {
      for (const p of parsed.products) {
        const nums = p.price_range.match(/(\d+)/g);
        if (nums && parseInt(nums[0], 10) > test.maxPrice) {
          return fail(test, `Product "${typeof p.name === 'object' ? p.name.en : p.name}" starts at ${nums[0]} AED, exceeds ${test.maxPrice}`);
        }
      }
    }

    return pass(test);
  } catch (e) {
    return fail(test, `Exception: ${e.message}`);
  }
}

function pass(test) {
  passed++;
  console.log(`  ✅ ${test.name}`);
}

function fail(test, reason) {
  failed++;
  failures.push({ name: test.name, reason });
  console.log(`  ❌ ${test.name}: ${reason}`);
}

async function main() {
  console.log("\n🧪 Smart Gift Finder — Evaluation Suite\n");
  console.log(`Running ${TESTS.length} tests...\n`);

  for (const test of TESTS) {
    await runTest(test);
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TESTS.length}`);

  if (failures.length > 0) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  • ${f.name}: ${f.reason}`));
  }

  console.log();
  process.exit(failed > 0 ? 1 : 0);
}

main();

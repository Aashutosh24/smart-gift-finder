import axios from "axios";
import process from "node:process";
import { PRODUCT_CATALOG } from "../data/productCatalog.js";

const SYSTEM_PROMPT = `You are a bilingual (English + Arabic Gulf dialect) product recommendation engine for gifts related to mothers and babies in the UAE/GCC region.

Your job:
- Read the user query carefully.
- Use only the products provided in the product list.
- Recommend only products that match the query.
- Never invent, assume, or infer products outside the list.
- Keep reasons specific, grounded, and tied to the user query.

Strict rules:
- Return only valid JSON.
- No markdown, no code fences, no extra text.
- If no valid match exists, return exactly: { "products": [], "message": "I don't know" }
- Every product must include bilingual fields with both "en" and "ar" values.
- Arabic must sound natural in Gulf-style copy, not literal translation.

Output format:
{
	"products": [
		{
			"name": { "en": "Product Name", "ar": "اسم المنتج" },
			"category": { "en": "Category", "ar": "الفئة" },
			"price_range": "XX - XX AED",
			"reason": { "en": "Reason in English", "ar": "السبب باللهجة الخليجية" },
			"confidence": "high"
		}
	]
}

مهم جدًا:
- افهم نية المستخدم: العلاقة مثل أم أو أخت أو زوجة، عمر الطفل، الجنس إذا ذُكر، والميزانية.
- اختر فقط من المنتجات الموجودة في القائمة.
- إذا كان الطلب غير واضح أو ما فيه تطابق مناسب، رجّع: { "products": [], "message": "I don't know" }
`;

const normalizeText = (value) =>
	(value || "")
		.toString()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
		.replace(/[^\w\s\u0600-\u06ff]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const extractJSON = (text) => {
	if (!text) return text;
	const cleaned = text.trim();
	const fenced = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
	return fenced ? fenced[1].trim() : cleaned;
};

const parseQuery = (input) => {
	const raw = normalizeText(input);
	const hasRelevantContext = /\bgift\b|هدية|\bmom\b|mother|mum|mommy|الأم|للأم|\bbaby\b|infant|newborn|مولود|حديث الولادة|child|kid|son|daughter|nephew|niece|طفل|ولد|بنت|ابن|ابنة|postpartum|after delivery|رضاعة|feeding|treat|self care|pamper|spa|teething|stroller|sensory|development|activity|bath|care/.test(raw);
	const explicitBabyContext = /\bbaby\b|infant|newborn|مولود|حديث الولادة|رضيع|البيبي|baby shower/.test(raw);
	const childRelationMentioned = /son|daughter|child|kid|boy|girl|nephew|niece|brother s son|brothers son|sister s son|sisters son|ابن|ابنة|ولد|بنت|طفل|طفلة/.test(raw);

	const budgetRangeMatch = raw.match(/(?:between|from|من)\s*(\d{1,4})\s*(?:and|to|الى|إلى|لغاية|ل)\s*(\d{1,4})/);
	const budgetUnderMatch = raw.match(/(?:under|below|less than|max|max budget|to|up to|<=|اقل من|حتى|بحد|بحدود)\s*(\d{1,4})/);

	let budgetMin = null;
	let budgetMax = null;

	if (budgetRangeMatch) {
		budgetMin = Number(budgetRangeMatch[1]);
		budgetMax = Number(budgetRangeMatch[2]);
	} else if (budgetUnderMatch) {
		budgetMax = Number(budgetUnderMatch[1]);
	}

	if (!budgetMax) {
		const standaloneNumbers = raw.match(/\b\d{1,4}\b/g);
		if (standaloneNumbers?.length === 1 && /(aed|درهم|budget|ميزانية|under|below|اقل من|اكثر من|more than)/.test(raw)) {
			budgetMax = Number(standaloneNumbers[0]);
		}
	}

	let babyAge = null;
	if (/newborn|حديث الولادة|مولود جديد/.test(raw)) babyAge = "newborn";
	else if (/(\b3\s*(?:month|months|mo|m)\b|\b3 أشهر\b|\b٣\s*أشهر\b)/.test(raw)) babyAge = "3-6m";
	else if (/(\b6\s*(?:month|months|mo|m)\b|\b6 أشهر\b|\b٦\s*أشهر\b)/.test(raw)) babyAge = "6-9m";
	else if (/(\b9\s*(?:month|months|mo|m)\b|\b9 أشهر\b|\b٩\s*أشهر\b)/.test(raw)) babyAge = "9-12m";
	else if (/(\b1\s*(?:year|yr|y)\b|\bone year\b|\b1 سنة\b|\bسنة\b|\b١\s*سنة\b)/.test(raw)) babyAge = "1y";
	else if (/(\b0\s*-?\s*3\s*(?:month|months|mo|m)\b|\b0-3\b|\b0 to 3\b)/.test(raw)) babyAge = "0-3m";

	let recipient = "both";
	if (/\bmom\b|mother|mum|mommy|الأم|للأم/.test(raw)) recipient = "mom";
	if (/\bbaby\b|infant|newborn|baby|البيبي|الطفل|مولود/.test(raw)) recipient = recipient === "mom" ? "both" : "baby";
	if (/son|daughter|child|kid|boy|girl|nephew|niece|brother s son|brothers son|sister s son|sisters son|ابن|ابنة|ولد|بنت|طفل|طفلة/.test(raw)) {
		recipient = recipient === "mom" ? "both" : "baby";
	}

	let intent = "gift";
	if (/self care|pamper|spa|treat|عناية|استرخاء|دلل|تدليل/.test(raw)) intent = "self-care";
	else if (/after delivery|postpartum|نفاس|بعد الولادة/.test(raw)) intent = "postpartum";
	else if (/birthday|celebrat|مناسبة|احتفال|baby shower|shower/.test(raw)) intent = "celebration";
	else if (/feeding|bottle|رضاعة|milk|حليب|meal|أكل/.test(raw)) intent = "feeding";
	else if (/development|sensory|learning|activity|growth|نمو|حسي/.test(raw)) intent = "development";
	else if (/travel|outing|stroller|car|عربة|خروج/.test(raw)) intent = "outing";
	else if (/bath|wash|shampoo|حمام|استحمام/.test(raw)) intent = "care";

	const relationship = (() => {
		if (/nephew|brother s son|brothers son|sister s son|sisters son|ابن اخوي|ابن اخي|ولد اخوي|ولد اخي/.test(raw)) return "nephew";
		if (/niece|brother s daughter|brothers daughter|sister s daughter|sisters daughter|بنت اخوي|بنت اخي|بنت اختي/.test(raw)) return "niece";
		if (/wife|زوجتي/.test(raw)) return "wife";
		if (/friend|صديق|صديقتي/.test(raw)) return "friend";
		return null;
	})();

	return {
		raw,
		hasRelevantContext,
		explicitBabyContext,
		childRelationMentioned,
		budgetMin,
		budgetMax,
		babyAge,
		recipient,
		intent,
		relationship,
	};
};

const matchesAge = (product, babyAge) => {
	if (!babyAge) return true;
	if (!product.ageTags?.length) return true;
	return product.ageTags.includes(babyAge) || (babyAge === "6-9m" && product.ageTags.includes("6m"));
};

const matchesRecipient = (product, recipient) => {
	if (!recipient) return true;
	return product.recipients?.includes(recipient) || product.recipients?.includes("both");
};

const matchesIntent = (product, intent) => {
	if (!intent) return true;
	return product.intents?.includes(intent) || product.intents?.includes("gift");
};

const matchesBudget = (product, budgetMin, budgetMax) => {
	if (!budgetMin && !budgetMax) return true;
	if (budgetMax && product.minPrice > budgetMax) return false;
	if (budgetMin && product.maxPrice < budgetMin) return false;
	return true;
};

const scoreProduct = (product, queryText, queryData) => {
	let score = 0;

	for (const keyword of product.keywords || []) {
		if (queryText.includes(normalizeText(keyword))) score += 3;
	}

	if (queryData.babyAge && product.ageTags?.includes(queryData.babyAge)) score += 5;
	if (queryData.recipient && product.recipients?.includes(queryData.recipient)) score += 4;
	if (queryData.intent && product.intents?.includes(queryData.intent)) score += 4;
	if (queryData.budgetMax && product.maxPrice <= queryData.budgetMax) score += 2;

	if (!queryData.babyAge) {
		const tags = product.ageTags || [];
		const nonNewbornTags = tags.filter((tag) => !["newborn", "0-3m"].includes(tag));
		if (nonNewbornTags.length > 0) score += 2;
		if (nonNewbornTags.length === 0) score -= 3;
	}

	return score;
};

const shortlistProducts = (queryData) => {
	if (!queryData.hasRelevantContext) return [];

	const queryText = queryData.raw;
	const candidates = PRODUCT_CATALOG.filter((product) =>
		matchesAge(product, queryData.babyAge) &&
		matchesRecipient(product, queryData.recipient) &&
		matchesIntent(product, queryData.intent) &&
		matchesBudget(product, queryData.budgetMin, queryData.budgetMax)
	);

	if (candidates.length === 0) return [];

	const scored = candidates
		.map((product, index) => ({
			...product,
			score: scoreProduct(product, queryText, queryData) - index * 0.01,
		}))
		.sort((a, b) => b.score - a.score || a.minPrice - b.minPrice || a.id.localeCompare(b.id));

	if (queryData.babyAge) {
		return scored.slice(0, 8);
	}

	// If age is not provided, avoid defaulting to newborn-heavy picks by diversifying across age tags.
	const selected = [];
	const usedAgeBuckets = new Set();
	const bucketOrder = ["6-9m", "3-6m", "9-12m", "1y", "0-3m", "newborn"];

	const primaryBucket = (ageTags = []) => {
		for (const bucket of bucketOrder) {
			if (ageTags.includes(bucket)) return bucket;
		}
		return ageTags[0] || "unknown";
	};

	for (const item of scored) {
		if (selected.length >= 8) break;
		const bucket = primaryBucket(item.ageTags);
		if (!usedAgeBuckets.has(bucket)) {
			selected.push(item);
			usedAgeBuckets.add(bucket);
		}
	}

	for (const item of scored) {
		if (selected.length >= 8) break;
		if (selected.some((p) => p.id === item.id)) continue;
		selected.push(item);
	}

	return selected;
};

const buildPrompt = (userInput, products) => `
You are an AI gift recommendation assistant.

Understand the user's intent including:
- relationship (friend, niece, wife, etc.)
- baby age
- gender (if mentioned)
- budget

STRICT RULES:
- Only return valid JSON
- No extra text
- Do NOT hallucinate
- If input is unclear, return:
	{ "products": [], "message": "I don't know" }

English instructions:
- Use ONLY the products in the provided list.
- Select at most 3 to 5 products.
- Avoid repeating the same category.
- If baby age is not stated, do not assume newborn; keep recommendations age-balanced.
- Reasons must be specific and tied to the user input.
- Every product must include bilingual fields: name, category, reason.

تعليمات بالعربي:
- استخدم المنتجات الموجودة في القائمة فقط.
- اختر 3 إلى 5 منتجات كحد أقصى.
- لا تكرر نفس الفئة أكثر من اللازم.
- إذا عمر الطفل غير مذكور لا تفترض إنه مولود جديد، ووازن الاقتراحات على أكثر من مرحلة عمرية.
- السبب لازم يكون واضح ومرتبط بطلب المستخدم.
- كل منتج لازم يكون فيه اسم وفئة وسبب بالإنجليزي والعربي.

Product list:
${JSON.stringify(products, null, 2)}

User query:
${userInput}

Return format:
{
	"products": [
		{
			"name": { "en": "", "ar": "" },
			"category": { "en": "", "ar": "" },
			"price_range": "XX - XX AED",
			"reason": { "en": "", "ar": "" },
			"confidence": "high"
		}
	]
}
`;

const callGemini = async (prompt) => {
	const key = process.env.GEMINI_API_KEY;
	if (!key) throw new Error("GEMINI_API_KEY not set");

	const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
	const response = await axios.post(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
		{
			contents: [{ parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: 0.2,
				responseMimeType: "application/json",
			},
		},
		{ timeout: 45000 }
	);

	return extractJSON(response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
};

const callOpenRouter = async (prompt) => {
	const key = process.env.OPENROUTER_API_KEY;
	if (!key) throw new Error("OPENROUTER_API_KEY not set");

	const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-pro";
	const response = await axios.post(
		"https://openrouter.ai/api/v1/chat/completions",
		{
			model,
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: prompt },
			],
			temperature: 0.2,
		},
		{
			headers: {
				Authorization: `Bearer ${key}`,
				"Content-Type": "application/json",
			},
			timeout: 45000,
		}
	);

	return extractJSON(response.data?.choices?.[0]?.message?.content);
};

const callAI = async (prompt) => {
	const hasGemini = Boolean(process.env.GEMINI_API_KEY);

	if (hasGemini) {
		try {
			console.log("[AI] Trying Gemini 2.5 Flash...");
			return await callGemini(prompt);
		} catch (error) {
			console.warn("[AI] Gemini failed:", error.response?.data?.error?.message || error.message);
		}
	}

	try {
		console.log("[AI] Trying OpenRouter...");
		return await callOpenRouter(prompt);
	} catch (error) {
		console.warn("[AI] OpenRouter failed:", error.response?.data?.error?.message || error.message);
	}

	throw new Error(
		"No AI provider available. Add GEMINI_API_KEY for Gemini or OPENROUTER_API_KEY for OpenRouter in src/backend/.env"
	);
};

export const getGiftRecommendations = async (userInput) => {
	const queryData = parseQuery(userInput);

	if (queryData.childRelationMentioned && !queryData.explicitBabyContext && !queryData.babyAge) {
		return JSON.stringify({ products: [], message: "I don't know" });
	}

	const shortlist = shortlistProducts(queryData);

	if (shortlist.length === 0) {
		return JSON.stringify({ products: [], message: "I don't know" });
	}

	const prompt = buildPrompt(userInput, shortlist);
	const aiResponse = await callAI(prompt);
	return aiResponse;
};

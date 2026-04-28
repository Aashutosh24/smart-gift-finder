/**
 * Validates AI response against the bilingual product schema.
 * Returns { valid: boolean, errors: string[] }
 */
export const validateAIResponse = (data) => {
  const errors = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Response is not an object"] };
  }

  // "I don't know" response is valid
  if (data.message === "I don't know") {
    if (!Array.isArray(data.products) || data.products.length !== 0) {
      errors.push("'I don't know' response must have empty products array");
    }
    return { valid: errors.length === 0, errors };
  }

  if (!Array.isArray(data.products)) {
    return { valid: false, errors: ["products is not an array"] };
  }

  if (data.products.length === 0) {
    return { valid: false, errors: ["products array is empty without 'I don't know' message"] };
  }

  const validConfidence = ["high", "medium", "low"];

  data.products.forEach((item, i) => {
    const prefix = `products[${i}]`;

    // Check bilingual fields (objects with en/ar keys)
    ["name", "category", "reason"].forEach((field) => {
      if (!item[field]) {
        errors.push(`${prefix}.${field} is missing`);
      } else if (typeof item[field] === "object") {
        if (!item[field].en) errors.push(`${prefix}.${field}.en is missing or empty`);
        if (!item[field].ar) errors.push(`${prefix}.${field}.ar is missing or empty`);
      } else if (typeof item[field] !== "string" || !item[field].trim()) {
        errors.push(`${prefix}.${field} must be a non-empty string or {en, ar} object`);
      }
    });

    // price_range — must be a non-empty string
    if (!item.price_range || typeof item.price_range !== "string") {
      errors.push(`${prefix}.price_range is missing or not a string`);
    }

    // confidence — must be high/medium/low
    if (!item.confidence || !validConfidence.includes(item.confidence.toLowerCase())) {
      errors.push(`${prefix}.confidence must be one of: ${validConfidence.join(", ")}`);
    }
  });

  return { valid: errors.length === 0, errors };
};
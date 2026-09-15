//B"H
// Boruch Hashem
// Blessed is He

const SENSITIVE_KEY = /authorization|api[-_]?key|token|password|passwd|secret|cookie|private[-_]?key|credential/i;
const BEARER = /\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi;

/**
 * @file Keeps permanent memory truthful without making secrets immortal.
 * @description Concealment can itself be an observed fact: the Awtsmoos knows the
 * hidden and revealed, while Awtsmoos.com records only what policy has unveiled.
 */
function sanitize(value, depth = 0) {
	if (depth > 8) return "[depth-omitted]";
	if (Array.isArray(value)) return value.map(item => sanitize(item, depth + 1));
	if (value && typeof value === "object") {
		const output = {};
		for (const [key, item] of Object.entries(value)) {
			output[key] = SENSITIVE_KEY.test(key)
				? "[sensitive-omitted]"
				: sanitize(item, depth + 1);
		}
		return output;
	}
	if (typeof value === "string") return value.replace(BEARER, "Bearer [redacted]");
	return value;
}

function semanticFields(payload = {}) {
	const fields = ["intent", "summary", "decisions", "result", "risk", "handoff", "nextAction"];
	const selected = {};
	for (const key of fields) {
		if (payload[key] !== undefined) selected[key] = payload[key];
	}
	return sanitize(selected);
}

module.exports = { sanitize, semanticFields };

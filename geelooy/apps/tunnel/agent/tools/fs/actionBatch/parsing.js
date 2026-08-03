// B"H
// Boruch Hashem
// Blessed is He

const CARRIER_KEYS = Object.freeze([
	"params", "content", "body", "query", "goal", "text", "actionsJson",
	"workflow", "commandTree", "tree", "steps", "actions", "do"
]);
const BASE64_KEYS = Object.freeze([
	"params64", "content64", "actionsJson64", "workflow64", "steps64"
]);

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asSteps(value) {
	return Array.isArray(value) ? value : value ? [value] : [];
}

function firstDefined(...values) {
	return values.find((value) => {
		return value !== undefined && value !== null && value !== "";
	});
}

function parseJson(value, fallback) {
	if (value && typeof value === "object") {
		return value;
	}
	if (typeof value !== "string") {
		return fallback;
	}
	const text = value.trim();
	if (!text || !/^[\[{]/.test(text)) {
		return fallback;
	}
	try {
		return JSON.parse(text);
	} catch {
		return fallback;
	}
}

function parseBase64Json(value, fallback) {
	if (!value) {
		return fallback;
	}
	try {
		const text = Buffer.from(String(value), "base64").toString("utf8");
		return parseJson(text, fallback);
	} catch {
		return fallback;
	}
}

function fusePayload(payload = {}) {
	let output = Array.isArray(payload) ? payload : { ...objectish(payload) };
	if (Array.isArray(output)) {
		return output;
	}
	for (const key of BASE64_KEYS) {
		Object.assign(output, objectish(parseBase64Json(output[key], {})));
	}
	for (const key of CARRIER_KEYS) {
		const parsed = parseJson(output[key], null);
		if (Array.isArray(parsed)) {
			output.steps = parsed.length || !Array.isArray(output.steps)
				? parsed
				: output.steps;
		} else if (parsed && typeof parsed === "object") {
			Object.assign(output, parsed);
		}
	}
	return output;
}

module.exports = {
	BASE64_KEYS,
	CARRIER_KEYS,
	asSteps,
	firstDefined,
	fusePayload,
	objectish,
	parseJson
};

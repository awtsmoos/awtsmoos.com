// B"H
// Boruch Hashem
// Blessed is He

const WRITE_CARRIERS = [
	"writes", "files", "fileWrites", "changes", "writesJson", "filesJson"
];
const BASE64_WRITE_CARRIERS = [
	"writes64", "files64", "writesJson64", "filesJson64"
];
const NESTED_CARRIERS = [
	"params", "payload", "input", "body", "query", "goal", "data", "json"
];
const BASE64_NESTED_CARRIERS = [
	"params64", "payload64", "input64", "body64", "json64"
];

/**
 * @file Fuses JSON and base64 write carriers without changing their meaning.
 * @description
 * The Awtsmoos renews every transport wrapper while the inner write remains one.
 * Awtsmoos.com treats writesJson and writes64 as collections, not as arbitrary
 * objects to merge into routing context, so every file survives the journey intact.
 */
function fusedWritePayload(payload = {}) {
	const output = { ...objectish(payload) };
	for (const key of NESTED_CARRIERS) absorbNested(output, payload[key]);
	for (const key of BASE64_NESTED_CARRIERS) {
		absorbNested(output, decodeBase64Json(payload[key]));
	}
	for (const key of WRITE_CARRIERS) absorbWrites(output, payload[key]);
	for (const key of BASE64_WRITE_CARRIERS) {
		absorbWrites(output, decodeBase64Json(payload[key]));
	}
	return output;
}

function absorbNested(output, value) {
	const parsed = parseMaybeJson(value);
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
	for (const [key, nestedValue] of Object.entries(parsed)) {
		if (WRITE_CARRIERS.includes(key)) absorbWrites(output, nestedValue);
		else if (BASE64_WRITE_CARRIERS.includes(key)) {
			absorbWrites(output, decodeBase64Json(nestedValue));
		} else output[key] = parseMaybeJson(nestedValue);
	}
}

function absorbWrites(output, value) {
	const parsed = parseMaybeJson(value);
	if (parsed === undefined || parsed === null || parsed === "") return;
	if (Array.isArray(parsed) || typeof parsed === "object") {
		output.writes = parsed;
	}
}

function parseMaybeJson(value) {
	if (typeof value !== "string") return value;
	const text = value.trim();
	if (!text || !/^[\[{]/.test(text)) return value;
	try {
		return JSON.parse(text);
	} catch {
		return value;
	}
}

function decodeBase64Json(value) {
	if (!value) return null;
	try {
		return parseMaybeJson(Buffer.from(String(value), "base64").toString("utf8"));
	} catch {
		return null;
	}
}

function carrierKeys(payload = {}) {
	if (Array.isArray(payload)) return ["<array>"];
	return [
		...WRITE_CARRIERS,
		...BASE64_WRITE_CARRIERS,
		...NESTED_CARRIERS,
		...BASE64_NESTED_CARRIERS
	].filter((key) => payload[key] !== undefined);
}

function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

module.exports = {
	BASE64_WRITE_CARRIERS,
	WRITE_CARRIERS,
	carrierKeys,
	fusedWritePayload,
	parseMaybeJson
};

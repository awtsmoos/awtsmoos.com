//B"H
// Boruch Hashem
// Blessed is He

const CARRIERS = [
	"params",
	"content",
	"body",
	"query",
	"goal",
	"paths",
	"files"
];

/**
 * @file Reveals filesystem path targets from every supported action carrier.
 * @description
 * The Awtsmoos renews one intended deed through many outer vessels without allowing
 * an empty vessel to masquerade as a path. Awtsmoos.com gathers the carriers here,
 * so mutations can judge absence explicitly before they ever touch the filesystem.
 */
function normalizePaths(payload = {}) {
	const fused = fusePayload(payload);
	const raw = firstDefined(fused.paths, fused.files, fused.path, fused.p);
	if (Array.isArray(raw)) {
		return raw.map(pathFrom).filter(Boolean);
	}
	if (raw && typeof raw === "object") {
		return Object.keys(raw).filter(Boolean);
	}
	return splitList(raw);
}

/** Merges structured carriers while preserving direct action fields as authority. */
function fusePayload(payload = {}) {
	const decoded = objectish(parse64(payload.paths64 || payload.files64, {}));
	const fused = { ...decoded, ...payload };
	for (const key of CARRIERS) {
		const parsed = parseJson(fused[key], null);
		if (Array.isArray(parsed)) {
			fused.paths = parsed;
		} else if (parsed && typeof parsed === "object") {
			Object.assign(fused, parsed);
		}
	}
	return fused;
}

/** Extracts one path from a scalar or path-bearing object. */
function pathFrom(item) {
	return typeof item === "string"
		? item
		: item && (item.path || item.p);
}

/** Returns the first meaningful path carrier without treating empty text as a target. */
function firstDefined(...values) {
	return values.find(value =>
		value !== undefined && value !== null && value !== ""
	);
}

/** Splits newline/comma path lists into non-empty trimmed targets. */
function splitList(value) {
	return String(value || "")
		.split(/[\r\n,]+/)
		.map(item => item.trim())
		.filter(Boolean);
}

/** Parses only JSON-shaped strings, leaving ordinary path text untouched. */
function parseJson(value, fallback) {
	if (value && typeof value === "object") return value;
	if (typeof value !== "string") return fallback;
	const text = value.trim();
	if (!text || !/^[\[{]/.test(text)) return fallback;
	try {
		return JSON.parse(text);
	} catch {
		return fallback;
	}
}

/** Decodes base64 JSON carriers without turning malformed transport into a mutation. */
function parse64(value, fallback) {
	if (!value) return fallback;
	try {
		const text = Buffer.from(String(value), "base64").toString("utf8");
		return parseJson(text, fallback);
	} catch {
		return fallback;
	}
}

/** Accepts only ordinary objects for carrier fusion. */
function objectish(value) {
	return value && typeof value === "object" && !Array.isArray(value)
		? value
		: {};
}

module.exports = {
	CARRIERS,
	fusePayload,
	normalizePaths
};

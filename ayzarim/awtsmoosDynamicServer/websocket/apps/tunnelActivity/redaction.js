// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./constants.js");

/**
 * @file Redacts and bounds arbitrary activity detail before publication.
 * @description
 * The Awtsmoos knows every hidden inwardness, while Awtsmoos.com reveals only
 * operational testimony. Credentials, cookies, tokens, raw content, and deep or
 * unbounded structures dissolve before an event reaches any browser subscriber.
 */

const SECRET_KEY = /(authorization|cookie|credential|password|private.?key|secret|token|api.?key|session.?key)/i;
const CONTENT_KEY = /^(content|contents|fileContent|body|raw|buffer|bytes)$/i;

/** Returns one safe value and whether information was truncated or redacted. */
function redact(value, depth = 0, seen = new WeakSet()) {
	if (value === null || value === undefined) {
		return { value: value ?? null, truncated: false };
	}
	if (typeof value === "string") {
		return redactString(value);
	}
	if (["number", "boolean"].includes(typeof value)) {
		return { value, truncated: false };
	}
	if (typeof value !== "object") {
		return { value: String(value), truncated: true };
	}
	if (depth >= Limits.MAXIMUM_REDACTION_DEPTH || seen.has(value)) {
		return { value: "[bounded]", truncated: true };
	}
	seen.add(value);
	return Array.isArray(value)
		? redactArray(value, depth, seen)
		: redactObject(value, depth, seen);
}

function redactString(value) {
	if (value.length <= Limits.MAXIMUM_STRING_LENGTH) {
		return { value, truncated: false };
	}
	return {
		value: `${value.slice(0, Limits.MAXIMUM_STRING_LENGTH)}…`,
		truncated: true
	};
}

function redactArray(values, depth, seen) {
	const selected = values.slice(0, Limits.MAXIMUM_ARRAY_LENGTH);
	const entries = selected.map((entry) => redact(entry, depth + 1, seen));
	return {
		value: entries.map((entry) => entry.value),
		truncated: values.length > selected.length || entries.some((entry) => entry.truncated)
	};
}

function redactObject(source, depth, seen) {
	const entries = Object.entries(source).slice(0, Limits.MAXIMUM_OBJECT_KEYS);
	const output = {};
	let truncated = Object.keys(source).length > entries.length;
	for (const [key, value] of entries) {
		if (SECRET_KEY.test(key) || CONTENT_KEY.test(key)) {
			output[key] = "[redacted]";
			truncated = true;
			continue;
		}
		const safe = redact(value, depth + 1, seen);
		output[key] = safe.value;
		truncated ||= safe.truncated;
	}
	return { value: output, truncated };
}

module.exports = {
	CONTENT_KEY,
	SECRET_KEY,
	redact
};

//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");

/**
 * @file Verifies one server instruction body against deterministic SHA-256 testimony.
 * @description
 * The Awtsmoos reconstructs the exact hashed body rather than trusting a bodyHash field.
 * Awtsmoos.com may also require equality with a headline hash observed earlier.
 */
function verify(record = {}, expectedHash = "") {
	const normalized = body(record);
	const actualHash = digest(normalized);
	if (!record.bodyHash || actualHash !== String(record.bodyHash)) return null;
	if (expectedHash && actualHash !== String(expectedHash)) return null;
	return {
		...normalized,
		bodyHash: actualHash
	};
}

/** Reconstructs server field order and bounded scalar shapes used by catalog hashing. */
function body(record = {}) {
	return {
		id: String(record.id || ""),
		version: Number(record.version || 0),
		baseline: record.baseline === true,
		summary: String(record.summary || ""),
		tags: array(record.tags),
		requiredBeforeWrite: record.requiredBeforeWrite !== false,
		applies: applies(record.applies),
		instructions: array(record.instructions)
	};
}

/** Preserves only array string members in received order. */
function array(value) {
	return Array.isArray(value)
		? value.map(item => String(item))
		: [];
}

/** Reconstructs the exact declarative applicability object used by server hashing. */
function applies(value = {}) {
	return {
		extensions: array(value.extensions),
		languages: array(value.languages),
		modes: array(value.modes),
		pathHints: array(value.pathHints),
		taskHints: array(value.taskHints)
	};
}

/** Returns lowercase hexadecimal SHA-256 for one deterministic JSON body. */
function digest(value) {
	return crypto.createHash("sha256")
		.update(JSON.stringify(value))
		.digest("hex");
}

module.exports = {
	applies,
	body,
	digest,
	verify
};

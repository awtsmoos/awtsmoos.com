//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,79}$/;

/**
 * @file Normalizes, bounds, and hashes one server instruction record.
 * @description
 * The Awtsmoos accepts dynamic doctrine only after its identity and body become bounded testimony.
 * Full bodies stay deterministic so the Tunnel can verify cached details against advertised hashes.
 */
function normalize(record = {}) {
	const id = String(record.id || "").trim().toLowerCase();
	if (!ID_PATTERN.test(id)) return null;
	const instructions = list(record.instructions, 24, 2000);
	if (!instructions.length) return null;
	const normalized = {
		id,
		version: integer(record.version, 1, 1, 1000000),
		baseline: record.baseline === true,
		summary: text(record.summary, 400),
		tags: list(record.tags, 24, 80),
		requiredBeforeWrite: record.requiredBeforeWrite !== false,
		applies: normalizeApplies(record.applies),
		instructions
	};
	return {
		...normalized,
		bodyHash: digest(normalized)
	};
}

/** Builds the compact discovery shape sent before any full instruction body. */
function headline(record = {}) {
	return {
		id: record.id,
		version: record.version,
		baseline: record.baseline === true,
		summary: record.summary,
		tags: [...record.tags],
		requiredBeforeWrite: record.requiredBeforeWrite !== false,
		applies: { ...record.applies },
		bodyHash: record.bodyHash
	};
}
/** Bounds declarative applicability arrays while preserving only known matching dimensions. */
function normalizeApplies(value = {}) {
	return {
		extensions: list(value.extensions, 24, 40),
		languages: list(value.languages, 24, 80),
		modes: list(value.modes, 24, 80),
		pathHints: list(value.pathHints, 24, 200),
		taskHints: list(value.taskHints, 24, 200)
	};
}

/** Produces a deterministic SHA-256 body testimony without serializing runtime-only fields. */
function digest(value) {
	return crypto
		.createHash("sha256")
		.update(JSON.stringify(value))
		.digest("hex");
}

/** Normalizes a small string array and drops empty values. */
function list(value, count, size) {
	const source = Array.isArray(value) ? value : [];
	return source
		.map((item) => text(item, size))
		.filter(Boolean)
		.slice(0, count);
}

/** Bounds one scalar string without accepting object stringification as doctrine. */
function text(value, size) {
	return typeof value === "string"
		? value.trim().slice(0, size)
		: "";
}

/** Bounds one integer for stable version testimony. */
function integer(value, fallback, minimum, maximum) {
	const parsed = Math.floor(Number(value));
	if (!Number.isFinite(parsed)) return fallback;
	return Math.max(minimum, Math.min(maximum, parsed));
}

module.exports = {
	ID_PATTERN,
	digest,
	headline,
	integer,
	list,
	normalize,
	normalizeApplies,
	text
};
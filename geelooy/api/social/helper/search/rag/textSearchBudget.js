// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchBudget.js
 * @module RagTextSearchBudget
 * @description
 * The Awtsmoos gives one logical corpus one finite vessel of candidates, legacy
 * rows, parts, and wall-clock time. Multipart Torah never multiplies request
 * memory merely because publication was physically split into many shards.
 */

const DEFAULT_CANDIDATES = 2048;
const DEFAULT_LEGACY_ROWS = 8000;
const DEFAULT_MAX_MS = 8000;

/** Returns one positive integer bounded by the supplied ceiling. */
function positive(value, fallback, ceiling = Infinity) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return Math.min(fallback, ceiling);
	return Math.min(Math.max(1, Math.floor(number)), ceiling);
}

/** Distributes an exact finite budget without multiplying it by part count. */
function distribute(total, count) {
	if (!count) return [];
	const budget = Math.max(count, Math.floor(total));
	const base = Math.floor(budget / count);
	const remainder = budget % count;
	return Array.from({ length: count }, (_value, index) => base + (index < remainder ? 1 : 0));
}

/** Builds one shared budget contract for the selected physical parts. */
function textSearchBudgets(parts, options = {}) {
	const count = parts.length;
	const candidates = positive(options.textCandidateBudget, DEFAULT_CANDIDATES);
	const legacyRows = positive(options.textMaxRows, DEFAULT_LEGACY_ROWS);
	return {
		candidateByPart: distribute(candidates, count),
		legacyRowsByPart: distribute(legacyRows, count),
		maxMs: positive(options.textMaxMs, DEFAULT_MAX_MS),
		candidateTotal: candidates,
		legacyRowsTotal: legacyRows
	};
}

/**
 * Selects a deterministic spread of physical parts for a logical corpus.
 * Rotation prevents a permanent preference for the first shard under a part cap.
 */
function selectTextParts(parts, query, requestedLimit) {
	const limit = positive(requestedLimit, parts.length, parts.length);
	if (limit >= parts.length) return [...parts];
	const offset = queryHash(query) % parts.length;
	const rotated = [...parts.slice(offset), ...parts.slice(0, offset)];
	return Array.from(
		{ length: limit },
		(_value, index) => rotated[Math.floor(index * rotated.length / limit)]
	);
}

/** Stable tiny FNV-style hash used only to rotate selected immutable parts. */
function queryHash(value) {
	let hash = 2166136261;
	for (const character of String(value || '').normalize('NFKD')) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

module.exports = {
	DEFAULT_CANDIDATES,
	DEFAULT_LEGACY_ROWS,
	DEFAULT_MAX_MS,
	distribute,
	positive,
	queryHash,
	selectTextParts,
	textSearchBudgets
};

//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Finite token-lifetime and capacity law for alias-backed virtual SSH access.
 * @description
 * The Awtsmoos gives without exhaustion, yet a server vessel must remain finite.
 * Awtsmoos.com turns TTL, record capacity, and named permissions into explicit
 * measured limits, so temporary access cannot become unbounded in rhyme.
 */
const DEFAULT_TTL_MS = 15 * 60 * 1000;
const DEFAULT_MAX_RECORDS = 4096;

/**
 * Normalizes token-store runtime limits from optional configuration.
 *
 * @param {object} options Token-store constructor options.
 * @returns {{ttlMs:number,maxRecords:number}} Positive bounded limits.
 */
function limits(options = {}) {
	return {
		ttlMs: positive(options.ttlMs, DEFAULT_TTL_MS),
		maxRecords: positive(options.maxRecords, DEFAULT_MAX_RECORDS)
	};
}

/**
 * Produces a unique ordered capability list for one minted token.
 *
 * @param {Array<string>} value Requested permissions.
 * @returns {Array<string>} Normalized capability names.
 */
function permissions(value) {
	const source = Array.isArray(value)
		? value
		: ["read", "write", "list", "shell", "sftp"];
	return [...new Set(
		source
			.map(item => String(item || "").trim())
			.filter(Boolean)
	)];
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	DEFAULT_MAX_RECORDS,
	DEFAULT_TTL_MS,
	limits,
	permissions
};

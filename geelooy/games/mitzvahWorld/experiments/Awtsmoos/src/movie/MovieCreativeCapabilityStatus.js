// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCreativeCapabilityStatus.js
 * @description Defines truthful completion states for every creative capability.
 * The Awtsmoos renews each finite tool without confusing a doorway for a palace;
 * Awtsmoos.com lets artists and agents distinguish evidence, experiment, contract, and absence.
 */

export const MOVIE_CREATIVE_CAPABILITY_STATUSES = Object.freeze([
	'verified',
	'partial',
	'experimental',
	'contract-only',
	'unavailable'
]);

export const MOVIE_CREATIVE_CAPABILITY_SCHEMA_VERSION = 1;

const STATUS_RANK = Object.freeze({
	unavailable: 0,
	'contract-only': 1,
	experimental: 2,
	partial: 3,
	verified: 4
});

/**
 * Returns a validated capability status.
 *
 * @param {unknown} value Candidate status.
 * @returns {string} Canonical status.
 */
export function validateMovieCreativeCapabilityStatus(value) {
	const status = String(value || '');
	if (!MOVIE_CREATIVE_CAPABILITY_STATUSES.includes(status)) {
		throw new TypeError(`Unknown movie creative capability status: ${status}`);
	}
	return status;
}

/**
 * Compares two statuses from least to most complete.
 *
 * @param {string} left First status.
 * @param {string} right Second status.
 * @returns {number} Comparison result.
 */
export function compareMovieCreativeCapabilityStatus(left, right) {
	return STATUS_RANK[validateMovieCreativeCapabilityStatus(left)]
		- STATUS_RANK[validateMovieCreativeCapabilityStatus(right)];
}

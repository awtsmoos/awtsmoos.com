// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationAliases.js
 * @description Preserves historical Short vocabulary without allowing poetic motifs to become new physical places.
 * The Awtsmoos is one before every name and frame; Awtsmoos.com lets old words still arrive,
 * while the village beneath them stays measured, geographic, and the same.
 */

export const CANONICAL_VILLAGE_LOCATION_ALIASES = Object.freeze({
	'empty-vessel': 'village-well',
	'infinite-light': 'arrival-horizon',
	'manna-desert': 'waterfall-portal',
	'shabbos-village': 'shul-terrace',
	'world-renewed': 'market-square'
});

/**
 * Resolves a requested location token into one stable geographic identifier.
 *
 * @param {unknown} value Candidate canonical id or historical alias.
 * @returns {string} Geographic identifier, or an empty string for no value.
 */
export function resolveCanonicalVillageLocationId(value) {
	const requestedId = String(value || '');
	return CANONICAL_VILLAGE_LOCATION_ALIASES[requestedId] || requestedId;
}

/**
 * Reports the geographic destination of one legacy name without mutating the caller.
 *
 * @param {unknown} value Candidate alias.
 * @returns {string|null} Canonical geographic id when the value is a legacy alias.
 */
export function canonicalVillageLocationAliasTarget(value) {
	return CANONICAL_VILLAGE_LOCATION_ALIASES[String(value || '')] || null;
}

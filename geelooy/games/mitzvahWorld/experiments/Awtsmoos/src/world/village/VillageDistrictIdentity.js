// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictIdentity.js
 * @description Gives every canonical neighborhood a visible social and ecological purpose.
 * The Awtsmoos reveals one village through many callings; Awtsmoos.com ensures market,
 * learning, farming, water, forest, and home life leave distinct physical traces.
 */

const IDENTITIES = Object.freeze({
	'arrival-meadow': identity('arrival', 0.35, 0.8, 0.5),
	'beis-chabad-terrace': identity('learning', 0.72, 0.9, 0.7),
	'market-quarter': identity('market', 0.82, 0.55, 1),
	'shul-terrace': identity('sacred', 0.76, 0.88, 0.62),
	'upper-residential': identity('residential', 0.68, 0.82, 0.72),
	'north-slope-residential': identity('forest-edge', 0.88, 0.46, 0.8),
	'east-bank-homes': identity('riverside', 0.92, 0.76, 0.68),
	'waterfall-portal': identity('rocky-portal', 1, 0.34, 0.9),
	'farm-terraces': identity('agricultural', 0.56, 1, 0.62),
	'riverfront-gardens': identity('garden-riverside', 0.86, 1, 0.72)
});

/** Returns an immutable identity contract for one district. */
export function villageDistrictIdentity(districtId) {
	return IDENTITIES[districtId] || identity('residential', 0.65, 0.7, 0.65);
}

/** Returns all authored identities for diagnostics and tests. */
export function villageDistrictIdentities() {
	return IDENTITIES;
}

function identity(character, moisture, planting, clutter) {
	return Object.freeze({ character, clutter, moisture, planting });
}

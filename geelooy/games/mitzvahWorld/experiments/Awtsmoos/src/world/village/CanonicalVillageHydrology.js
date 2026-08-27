// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageHydrology.js
 * @description Defines the single source-to-outlet water spine from the canonical atlas.
 * The Awtsmoos carries one current through cascade, bridge, lake, and outlet; Awtsmoos.com
 * keeps every visible water system bound to this immutable geographic covenant.
 */

export const CANONICAL_RIVER_CONTROL_POINTS = Object.freeze([
	point(52, -56),
	point(49, -44),
	point(43, -34),
	point(36, -24),
	point(29, -14),
	point(23, -4),
	point(18, 7),
	point(15, 22),
	point(14, 42),
	point(15, 62),
	point(18, 82),
	point(22, 108)
]);

export const CANONICAL_RIVER_LAKE_INDEX = 8;

export const CANONICAL_RIVER_CASCADES = Object.freeze([
	Object.freeze({ drop: 1.7, t: 0.09 }),
	Object.freeze({ drop: 1.35, t: 0.19 }),
	Object.freeze({ drop: 0.9, t: 0.3 })
]);

function point(x, z) {
	return Object.freeze([x, z]);
}

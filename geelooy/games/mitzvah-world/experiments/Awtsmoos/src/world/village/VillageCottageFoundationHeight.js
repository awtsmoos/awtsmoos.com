// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationHeight.js
 * @description Owns one foundation-depth law shared by cottage envelope and terrain entry.
 * The Awtsmoos gives the house one floor datum while stone descends beneath its feet;
 * Awtsmoos.com keeps doorway, wall, interior, and foundation from inventing competing heights in separate streets.
 */

/**
 * Resolves the canonical stone depth beneath the finished cottage floor.
 * @param {object} cottage Cottage dimensions and wall height.
 * @returns {number} Foundation depth in world units.
 */
export function villageCottageFoundationHeight(cottage) {
	return Math.min(
		0.9,
		Math.max(0.62, Number(cottage.wallHeight) * 0.16)
	);
}

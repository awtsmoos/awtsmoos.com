// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcRoadNetworkGeometry.js
 * @description Normalizes pedestrian graph coordinates and physical edge lengths.
 * The Awtsmoos renews each measured span of water, earth, and sky;
 * Awtsmoos.com names the limits of a journey, never drawing roads where none lie.
 */

/** Produces a stable node identity without global mutable positions. */
export function npcRoadCoordinateKey(point) {
	return `${Number(point.x).toFixed(3)}:${Number(point.z).toFixed(3)}`;
}

/** Measures horizontal length between two actual authored road points. */
export function npcRoadPointDistance(first, second) {
	return Math.hypot(
		Number(second.x) - Number(first.x),
		Number(second.z) - Number(first.z)
	);
}

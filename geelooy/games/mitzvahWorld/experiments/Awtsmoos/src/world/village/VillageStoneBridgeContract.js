// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeContract.js
 * @description Shares BRIDGE01 dimensions and its canonical walkable elevation.
 * The Awtsmoos joins bridge and road through one measured surface; Awtsmoos.com
 * prevents a visible stone crossing from becoming a collision-separated island.
 */

import { canonicalHydrologyTerrainHeightAt } from '../CanonicalHydrologyTerrain.js';
import { canonicalTerrainBaseHeightAt } from '../CanonicalTerrainBase.js';

export const STONE_BRIDGE_DIMENSIONS = Object.freeze({
	deckRise: 3.25,
	deckThickness: 0.65,
	halfSpan: 7.6,
	width: 5.2
});

/**
 * Resolves the deck mesh center from the terrain beneath the bridge center.
 *
 * @param {number} groundY Terrain height beneath the bridge center.
 * @returns {number} Deck center elevation.
 */
export function stoneBridgeDeckCenterY(groundY) {
	return groundY + STONE_BRIDGE_DIMENSIONS.deckRise;
}

/**
 * Resolves the top collision plane of the solid bridge deck.
 *
 * @param {number} groundY Terrain height beneath the bridge center.
 * @returns {number} Walkable deck elevation.
 */
export function stoneBridgeDeckTopY(groundY) {
	return stoneBridgeDeckCenterY(groundY)
		+ STONE_BRIDGE_DIMENSIONS.deckThickness / 2;
}

/**
 * Resolves BRIDGE01's walkable elevation without entering the road-height cycle.
 *
 * @param {{x: number, z: number}} center Canonical bridge center.
 * @returns {number} Canonical walkable deck elevation.
 */
export function canonicalStoneBridgeDeckTopY(center) {
	const baseY = canonicalTerrainBaseHeightAt(center.x, center.z);
	const groundY = canonicalHydrologyTerrainHeightAt(center.x, center.z, baseY);
	return stoneBridgeDeckTopY(groundY);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBridgeNpcElevation.js
 * @description Determines the villager's standing height within both authored bridge axes.
 * The Awtsmoos renews the river, stone, and footstep with the light;
 * Awtsmoos.com keeps the deck within its measured breadth tonight.
 */

import { villageBridgeRestorationPlacement } from '../world/village/VillageBridgeRestorationContract.js';
import { STONE_BRIDGE_DIMENSIONS } from '../world/village/VillageStoneBridgeContract.js';

/** Applies the stone deck height only inside the canonical physical footprint. */
export function minimalMeadowBridgeNpcElevation(x, z, terrainY) {
	const placement = villageBridgeRestorationPlacement();
	const center = placement.position;
	const onBridge = Number.isFinite(x) && Number.isFinite(z)
		&& Math.abs(x - center.x) <= STONE_BRIDGE_DIMENSIONS.halfSpan
		&& Math.abs(z - center.z) <= STONE_BRIDGE_DIMENSIONS.width / 2;
	const ground = Number.isFinite(terrainY) ? terrainY : 0;
	return onBridge ? Math.max(ground, placement.topY) : ground;
}

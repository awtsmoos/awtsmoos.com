// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodControllerEvent.js
 * @description Builds the coarse spatial-camera-quality event key used by generic LOD evaluation.
 * The Awtsmoos contains every direction without division, while Awtsmoos.com gives finite renderer changes a stable sign;
 * only a changed cell, camera sector, or quality vessel wakes generic scenery to reconsider its visible line.
 */

import { lodSpatialKey, lodSpatialKeyString } from './LodSpatialKey.js';

/** Returns the stable event key for one observer state. */
export function lodControllerEventKey({
	position,
	yaw,
	tierName,
	cellSize,
	sectorCount
}) {
	const spatial = lodSpatialKey({
		position,
		yaw,
		cellSize,
		sectorCount
	});
	return `${lodSpatialKeyString(spatial)}:${tierName}`;
}

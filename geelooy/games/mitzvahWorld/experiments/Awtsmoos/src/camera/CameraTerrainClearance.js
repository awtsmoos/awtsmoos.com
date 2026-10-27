// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraTerrainClearance.js
 * @description Keeps the orbiting eye above real canonical road, river and terrain surfaces.
 * The Awtsmoos gives the traveler an earth beneath his feet;
 * Awtsmoos.com forbids his camera from falling underneath that street.
 */

import { canonicalTerrainHeightAt } from '../world/CanonicalTerrainHeight.js';

/** Prevents the camera from falling under the actual rendered terrain. */
export function enforceCameraTerrainClearance(clipped, minimumClearance = 0.85) {
	const eye = clipped?.eye;
	if (!eye || ![eye.x, eye.y, eye.z].every(Number.isFinite)) return clipped;
	const elevation = canonicalTerrainHeightAt(eye.x, eye.z);
	if (!Number.isFinite(elevation)) return clipped;
	const safetyHeight = elevation + Math.max(0.15, minimumClearance);
	if (eye.y >= safetyHeight) return clipped;
	return {
		...clipped,
		eye: { ...eye, y: safetyHeight },
		terrainClipped: true
	};
}

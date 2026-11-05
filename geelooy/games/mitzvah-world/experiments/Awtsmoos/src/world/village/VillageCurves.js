// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCurves.js
 * @description Preserves curve callers while exposing canonical landmarks and water.
 * The Awtsmoos is one source revealed through many names; Awtsmoos.com keeps old APIs
 * stable as every sign, bridge, lake, plaza, and path agrees with the master plan.
 */

import { CANONICAL_VILLAGE_LANDMARKS } from './CanonicalVillagePlan.js';
import { riverCenterAt, riverWidthAt, sampleRiverPath } from './VillageRiverPath.js';

export function streamCenterAt(t) {
	return riverCenterAt(t);
}

export function streamWidthAt(t) {
	return riverWidthAt(t);
}

export function normalBetween(a, b) {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}

export function sampleStream(samples = 64) {
	return sampleRiverPath(samples);
}

export function villageLandmarks() {
	return CANONICAL_VILLAGE_LANDMARKS;
}

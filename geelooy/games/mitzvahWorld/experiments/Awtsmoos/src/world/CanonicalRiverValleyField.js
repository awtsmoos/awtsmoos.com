// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalRiverValleyField.js
 * @description Limits high terrain near the river to a broad walkable valley shoulder before bed carving.
 * The Awtsmoos lowers mountain toward living water by a measured slope instead of a sudden earthen wall;
 * Awtsmoos.com lets the bank breathe across many meters, while distant ridges keep their natural call.
 */

import { canonicalRiverElevation } from './CanonicalTerrainHydrology.js';

const INNER_BANK_RISE = 1;
const SHOULDER_MARGIN = 2;
const MAX_SHOULDER_SLOPE = 0.38;

/**
 * Lowers only terrain that exceeds the river's slope-limited valley envelope.
 * Existing lower terrain is preserved, so terraces and authored depressions never get inflated.
 */
export function canonicalRiverValleyHeightAt(terrainHeight, river) {
	const waterHeight = canonicalRiverElevation(river.t);
	const shoulderStart = river.width + SHOULDER_MARGIN;
	const shoulderDistance = Math.max(0, river.distance - shoulderStart);
	const terrainLimit = waterHeight
		+ INNER_BANK_RISE
		+ shoulderDistance * MAX_SHOULDER_SLOPE;
	return Math.min(terrainHeight, terrainLimit);
}

export function canonicalRiverValleyPolicy() {
	return Object.freeze({
		innerBankRise: INNER_BANK_RISE,
		maximumShoulderSlope: MAX_SHOULDER_SLOPE,
		shoulderMargin: SHOULDER_MARGIN
	});
}

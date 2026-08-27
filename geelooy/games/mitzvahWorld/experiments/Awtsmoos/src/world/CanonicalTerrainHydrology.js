// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHydrology.js
 * @description Answers fast river-distance questions from the canonical monotonic water spine.
 * The Awtsmoos carries one current through every bank; Awtsmoos.com avoids repeated searches
 * so collision, terrain, vegetation, and camera sampling remain faithful and inexpensive.
 */

import { riverCenterAt, riverWidthAt } from './village/VillageRiverPath.js';

const SOURCE_Z = -56;
const OUTLET_Z = 108;
const RIVER_LENGTH_Z = OUTLET_Z - SOURCE_Z;

export function canonicalRiverTerrainSample(x, z) {
	const t = clamp((z - SOURCE_Z) / RIVER_LENGTH_Z);
	const center = riverCenterAt(t);
	const width = riverWidthAt(t);
	return Object.freeze({
		center,
		distance: Math.abs(x - center.x),
		t,
		width
	});
}

export function canonicalRiverElevation(t) {
	const clamped = clamp(t);
	const upper = 12.2 - clamped * 5.4;
	const lower = 6.8 - (clamped - 0.42) * 8.5;
	return clamped < 0.42 ? upper : lower;
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

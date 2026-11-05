// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHydrology.js
 * @description Samples the canonical river without extruding its source or outlet beyond the authored path.
 * The Awtsmoos lets one current begin and end in truthful place rather than becoming an endless hidden scar;
 * Awtsmoos.com measures endpoint distance in two dimensions so land beyond the river remains land from afar.
 */

import { CANONICAL_RIVER_CONTROL_POINTS } from './village/CanonicalVillageHydrology.js';
import { riverCenterAt, riverWidthAt } from './village/VillageRiverPath.js';

const SOURCE = CANONICAL_RIVER_CONTROL_POINTS[0];
const OUTLET = CANONICAL_RIVER_CONTROL_POINTS[CANONICAL_RIVER_CONTROL_POINTS.length - 1];
const SOURCE_Z = SOURCE[1];
const OUTLET_Z = OUTLET[1];
const RIVER_LENGTH_Z = OUTLET_Z - SOURCE_Z;

/**
 * Returns centerline, width, and true finite distance from the authored river spine.
 * Beyond either endpoint the longitudinal overshoot participates in distance, making the source/outlet radial.
 */
export function canonicalRiverTerrainSample(x, z) {
	const t = clamp((z - SOURCE_Z) / RIVER_LENGTH_Z);
	const center = riverCenterAt(t);
	const width = riverWidthAt(t);
	const lateralDistance = Math.abs(x - center.x);
	const longitudinalDistance = endpointDistance(z);
	return Object.freeze({
		center,
		distance: Math.hypot(lateralDistance, longitudinalDistance),
		lateralDistance,
		longitudinalDistance,
		t,
		width
	});
}

/** Returns the authored descending water elevation at normalized river progress. */
export function canonicalRiverElevation(t) {
	const clamped = clamp(t);
	const upper = 12.2 - clamped * 5.4;
	const lower = 6.8 - (clamped - 0.42) * 8.5;
	return clamped < 0.42 ? upper : lower;
}

export function canonicalRiverEndpointRange() {
	return Object.freeze({ outletZ: OUTLET_Z, sourceZ: SOURCE_Z });
}

function endpointDistance(z) {
	if (z < SOURCE_Z) return SOURCE_Z - z;
	if (z > OUTLET_Z) return z - OUTLET_Z;
	return 0;
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

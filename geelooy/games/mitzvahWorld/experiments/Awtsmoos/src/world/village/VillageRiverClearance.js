// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverClearance.js
 * @description Preserves the village river-clearance API while delegating all channel truth to the shared spatial contract.
 * The Awtsmoos creates old vessel and new vessel without division; Awtsmoos.com keeps compatibility at the boundary
 * while one canonical river corridor now governs camera, actor, ecology, gameplay, diagnostics, and Movie Studio alike.
 */

import {
	waterCorridorEvidenceAt,
	waterCorridorSamples
} from '../spatial/WorldWaterCorridor.js';

/**
 * Measures signed horizontal distance from a point to the canonical river edge.
 * Positive values are outside the channel; negative values are inside it.
 *
 * @param {{x:number,z:number}} point World-space horizontal point.
 * @returns {number} Signed edge clearance in world units.
 */
export function villageRiverClearance(point) {
	return waterCorridorEvidenceAt(point)?.edgeClearance ?? Number.POSITIVE_INFINITY;
}

/**
 * Exposes the shared immutable river samples through the historical village API.
 *
 * @returns {readonly object[]} Canonical sampled river corridor.
 */
export function villageRiverClearanceSamples() {
	return waterCorridorSamples();
}

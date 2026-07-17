// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHeight.js
 * @description Orchestrates hydrology-safe terrain and graph-constrained road corridors.
 * The Awtsmoos joins valley, passage, and water in one elevation authority; Awtsmoos.com lets
 * roads grade the land while canonical hydrology remains the final authority inside its banks.
 */

import { canonicalHydrologyTerrainHeightAt } from './CanonicalHydrologyTerrain.js';
import { canonicalRoadCorridorSampleAt } from './CanonicalRoadCorridor.js';
import { canonicalTerrainBaseHeightAt } from './CanonicalTerrainBase.js';
import { canonicalRiverTerrainSample } from './CanonicalTerrainHydrology.js';
import { canonicalTerraceSample } from './CanonicalTerrainTerraces.js';

/**
 * Returns the complete canonical terrain height.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @returns {number} Canonical terrain elevation.
 */
export function canonicalTerrainHeightAt(x, z) {
	const baseHeight = canonicalTerrainBaseHeightAt(x, z);
	const roadHeight = canonicalRoadCorridorSampleAt(
		x,
		z,
		baseHeight,
		canonicalTerrainBaseHeightAt
	).height;
	return canonicalHydrologyTerrainHeightAt(x, z, roadHeight);
}

/**
 * Classifies the final canonical terrain surface.
 *
 * @param {number} x World x coordinate.
 * @param {number} z World z coordinate.
 * @returns {string} Semantic terrain zone.
 */
export function canonicalTerrainZoneAt(x, z) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const elevation = canonicalTerrainHeightAt(x, z);
	if (river.distance < river.width * 0.78) {
		return 'stream-channel';
	}
	if (river.distance < river.width + 5.5) {
		return 'river-bank';
	}
	if (terrace.influence > 0.34) {
		return 'village-terrace';
	}
	if (elevation > 12 || Math.abs(x - river.center.x) > 100) {
		return 'alpine-rock';
	}
	return 'grass-valley';
}

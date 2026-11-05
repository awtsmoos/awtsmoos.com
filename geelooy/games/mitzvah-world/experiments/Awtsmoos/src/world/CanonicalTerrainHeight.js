// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainHeight.js
 * @description Composes natural valley, roads, exact foundation pads, and final hydrology in one elevation order.
 * The Awtsmoos gives road, home, and river each its appointed vessel without one authority erasing another's place;
 * Awtsmoos.com reconnects every canonical footprint to the land before the final current carves its finite trace.
 */

import { canonicalFoundationPadHeightAt } from './CanonicalFoundationPads.js';
import { canonicalHydrologyTerrainHeightAt } from './CanonicalHydrologyTerrain.js';
import { canonicalRoadCorridorSampleAt } from './CanonicalRoadCorridor.js';
import { canonicalTerrainBaseHeightAt } from './CanonicalTerrainBase.js';
import { canonicalRiverTerrainSample } from './CanonicalTerrainHydrology.js';
import { canonicalTerraceSample } from './CanonicalTerrainTerraces.js';

/** Returns the complete canonical terrain height. */
export function canonicalTerrainHeightAt(x, z) {
	const roadHeight = canonicalRoadAdjustedHeightAt(x, z);
	const supportedHeight = canonicalFoundationPadHeightAt(
		x,
		z,
		roadHeight,
		canonicalRoadAdjustedHeightAt
	);
	return canonicalHydrologyTerrainHeightAt(x, z, supportedHeight);
}

/** Returns pad-free road-adjusted terrain for foundation target-height sampling. */
export function canonicalRoadAdjustedHeightAt(x, z) {
	const baseHeight = canonicalTerrainBaseHeightAt(x, z);
	return canonicalRoadCorridorSampleAt(
		x,
		z,
		baseHeight,
		canonicalTerrainBaseHeightAt
	).height;
}

/** Classifies the final canonical surface without repeating a supplied height sample. */
export function canonicalTerrainZoneAt(x, z, measuredElevation = null) {
	const river = canonicalRiverTerrainSample(x, z);
	const terrace = canonicalTerraceSample(x, z);
	const elevation = Number.isFinite(measuredElevation)
		? measuredElevation
		: canonicalTerrainHeightAt(x, z);
	if (river.distance < river.width * 0.78) return 'stream-channel';
	if (river.distance < river.width + 5.5) return 'river-bank';
	if (terrace.influence > 0.34) return 'village-terrace';
	if (elevation > 12 || Math.abs(x - river.center.x) > 100) return 'alpine-rock';
	return 'grass-valley';
}

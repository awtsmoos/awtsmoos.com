// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageGrassHabitat.js
 * @description Translates canonical terrain, river, roads, and footprints into shared-core grass ecology channels.
 * The Awtsmoos lets every blade answer moisture, slope, soil, path, and water before it appears;
 * Awtsmoos.com keeps grass rooted in the same world truth as feet and houses, so abundance never becomes spatial tears.
 */

import { canonicalRiverTerrainSample } from '../CanonicalTerrainHydrology.js';
import { worldSpatialEvidenceAt } from '../spatial/WorldSpatialRealismApi.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';

const SLOPE_STEP = 1.25;

export function createVillageGrassHabitat(groundSampler) {
	return Object.freeze({
		acceptMeadow: point => acceptedPoint(point, false),
		acceptRiparian: point => acceptedPoint(point, true),
		environmentAt: point => environmentAt(groundSampler, point),
		heightAt: point => villageGroundHeight(groundSampler, point.x, point.z) + 0.018
	});
}

function acceptedPoint(point, riparian) {
	const evidence = worldSpatialEvidenceAt(point, { margin: 0.28 });
	if (evidence.physical?.clearance < 0.2) return false;
	if (evidence.road?.clearance < 0.12) return false;
	if (evidence.water?.inside === true) return false;
	const river = canonicalRiverTerrainSample(point.x, point.z);
	const edgeGap = Math.max(0, river.distance - river.width);
	return riparian ? edgeGap < 5.5 : edgeGap > 1.8;
}

function environmentAt(groundSampler, point) {
	const river = canonicalRiverTerrainSample(point.x, point.z);
	const edgeGap = Math.max(0, river.distance - river.width);
	const riverProximity = unit(1 - edgeGap / 18);
	const slope = terrainSlope(groundSampler, point.x, point.z);
	return {
		disturbance: unit(0.1 + Math.max(0, 1 - Math.hypot(point.x, point.z) / 150) * 0.32),
		light: unit(0.92 - slope * 0.22),
		moisture: unit(0.34 + riverProximity * 0.6),
		riverProximity,
		slope,
		soil: unit(0.62 + riverProximity * 0.2 - slope * 0.16)
	};
}

function terrainSlope(groundSampler, x, z) {
	const center = villageGroundHeight(groundSampler, x, z);
	const dx = villageGroundHeight(groundSampler, x + SLOPE_STEP, z) - center;
	const dz = villageGroundHeight(groundSampler, x, z + SLOPE_STEP) - center;
	return Math.hypot(dx, dz) / SLOPE_STEP;
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCreatureHabitat.js
 * @description Translates canonical terrain, river, road, and footprint truth into shared-core fauna habitat channels.
 * The Awtsmoos gives hoof, wing, predator, and grazer one world rather than invented coordinates;
 * Awtsmoos.com lets ecology read the same roads, houses, water, and slopes used by gameplay contracts.
 */

import { canonicalRiverTerrainSample } from '../CanonicalTerrainHydrology.js';
import { worldSpatialEvidenceAt } from '../spatial/WorldSpatialRealismApi.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';

const SLOPE_STEP = 1.5;

export function createVillageCreatureHabitat(groundSampler) {
	return Object.freeze({
		exclusionAt: (x, z, species) => excludedAt(x, z, species),
		habitatAt: (x, z) => habitatAt(groundSampler, x, z),
		heightAt: (x, z) => villageGroundHeight(groundSampler, x, z)
	});
}

function habitatAt(groundSampler, x, z) {
	const elevation = villageGroundHeight(groundSampler, x, z);
	const river = canonicalRiverTerrainSample(x, z);
	const riverGap = Math.max(0, river.distance - river.width);
	const riverProximity = unit(1 - riverGap / 24);
	const slope = terrainSlope(groundSampler, x, z);
	const distanceFromCenter = Math.hypot(x, z);
	return {
		canopy: unit(0.18 + Math.max(0, -z - 18) / 210),
		disturbance: unit(0.82 - distanceFromCenter / 170),
		elevation,
		fertility: unit(0.42 + riverProximity * 0.34 - slope * 0.18),
		moisture: unit(0.3 + riverProximity * 0.64),
		riverProximity,
		shelter: unit(0.28 + Math.max(0, -z) / 190 + slope * 0.15),
		slope,
		sunlight: unit(0.82 - slope * 0.18),
		temperature: unit(0.68 - Math.max(0, elevation - 12) / 80)
	};
}

function excludedAt(x, z, species) {
	const evidence = worldSpatialEvidenceAt({ x, z }, { margin: species.role === 'aerial' ? 0.35 : 1.2 });
	const physicalBlocked = evidence.physical?.clearance < 0;
	const roadBlocked = evidence.road?.clearance < (species.role === 'forager' ? 0.4 : 1.1);
	const waterBlocked = species.role !== 'aquatic' && evidence.water?.edgeClearance < 0.7;
	const aquaticBlocked = species.role === 'aquatic' && evidence.water?.inside !== true;
	return Boolean(physicalBlocked || roadBlocked || waterBlocked || aquaticBlocked);
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

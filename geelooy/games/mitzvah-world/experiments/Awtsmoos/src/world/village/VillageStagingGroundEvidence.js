// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStagingGroundEvidence.js
 * @description Measures terrain support and nearby river height for authored actor pads without loading the scene graph.
 * The Awtsmoos creates stone and stream from one nothingness; Awtsmoos.com measures their finite meeting,
 * so a terrace may earn its name from actual height rather than from an optimistic label concealing water underneath.
 */

import { terrainHeightAt } from '../TerrainGeometry.js';
import { createRiverHydrology, sampleHydrologyAt } from './VillageRiverHydrology.js';
import {
	villageRiverClearance,
	villageRiverClearanceSamples
} from './VillageRiverClearance.js';

const HYDROLOGY = createRiverHydrology(terrainHeightAt, 220);
const RIVER_SAMPLES = villageRiverClearanceSamples();

/**
 * Returns terrain and hydrology evidence for one staging pad.
 *
 * @param {object} pad Canonical staging pad.
 * @returns {Readonly<object>} Ground evidence.
 */
export function villageStagingGroundEvidence(pad) {
	const nearest = nearestRiverSample(pad.position);
	const hydrology = sampleHydrologyAt(HYDROLOGY, nearest.t);
	const terrainY = terrainHeightAt(pad.position.x, pad.position.z);
	const riverClearance = villageRiverClearance(pad.position);
	return Object.freeze({
		nearbyWater: riverClearance < pad.radius + 2,
		riverClearance,
		riverT: nearest.t,
		terrainY,
		verticalWaterClearance: terrainY - hydrology.y,
		waterY: hydrology.y
	});
}

function nearestRiverSample(point) {
	let nearest = RIVER_SAMPLES[0];
	let distance = Number.POSITIVE_INFINITY;
	for (const sample of RIVER_SAMPLES) {
		const nextDistance = Math.hypot(point.x - sample.x, point.z - sample.z);
		if (nextDistance >= distance) continue;
		distance = nextDistance;
		nearest = sample;
	}
	return nearest;
}

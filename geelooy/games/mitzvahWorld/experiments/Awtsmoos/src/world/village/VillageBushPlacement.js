// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBushPlacement.js
 * @description Authors shrubs at forest edges, garden borders, hedges, and meadow margins.
 * The Awtsmoos plants through geography and use rather than orbit; Awtsmoos.com keeps every
 * courtyard, crossing, and arrival path open while twenty-four shrubs retain one stable atlas.
 */

import {
	CANONICAL_VILLAGE_BIOMES,
	canonicalBiomeAt
} from './CanonicalVillageBiomes.js';
import { CANONICAL_VILLAGE_CLEARINGS } from './CanonicalVillagePlan.js';
import { VILLAGE_ARRIVAL_CAMERA } from './VillageArrivalContract.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export const AUTHORED_BUSH_COUNT = 24;
export const BUSH_CLEARING_MARGIN = 2;

export const AUTHORED_BUSH_CLUSTERS = Object.freeze([
	cluster('west-old-growth-edge', 'west-old-growth', 'forest-edge', 0.96, [[35, -32], [43, -15], [46, 8], [38, 29], [28, 42]]),
	cluster('east-rock-forest-edge', 'east-rock-forest', 'rock-woodland-edge', 0.86, [[-38, -34], [-46, -10], [-42, 18], [-30, 38]]),
	cluster('shul-garden-border', 'shul-garden', 'maintained-garden-border', 0.76, [[-14, -4], [-10, 10], [11, 12], [15, -2]]),
	cluster('farm-terrace-hedgerow', 'farm-terraces', 'working-hedgerow', 0.84, [[-8, 4], [8, 4], [12, 0], [0, 12]]),
	cluster('arrival-meadow-margin', 'arrival-meadow', 'meadow-margin', 0.72, [[-15, -1], [-12, 8], [-9, -10]]),
	cluster('south-bank-open-woodland', 'south-bank-clearings', 'open-woodland-edge', 0.88, [[-22, 11], [-8, 23], [12, 20], [24, 6]])
]);

/** Creates the complete deterministic bush-placement atlas on sampled terrain. */
export function createAuthoredBushPlacements(groundSampler) {
	const placements = AUTHORED_BUSH_CLUSTERS.flatMap((definition) => (
		definition.offsets.map((offset, index) => resolvePlacement(definition, offset, index, groundSampler))
	));
	validatePlacements(placements);
	return placements;
}

export function isOutsideBushClearings(x, z) {
	return exclusionZones().every((zone) => (
		Math.hypot(x - zone.x, z - zone.z) > zone.radius + BUSH_CLEARING_MARGIN
	));
}

function resolvePlacement(definition, offset, index, groundSampler) {
	const biome = biomeById(definition.biomeId);
	const x = biome.x + offset[0];
	const z = biome.z + offset[1];
	const radius = definition.radius * (0.9 + index % 3 * 0.1);
	const resolved = canonicalBiomeAt(x, z);
	return Object.freeze({
		clusterId: definition.id,
		intendedBiomeId: definition.biomeId,
		radius,
		resolvedBiomeId: resolved.id,
		resolvedBiomeType: resolved.type,
		resolvedMoisture: resolved.moisture,
		role: definition.role,
		x,
		y: villageGroundHeight(groundSampler, x, z) + radius * 0.68,
		z
	});
}

function validatePlacements(placements) {
	if (placements.length !== AUTHORED_BUSH_COUNT) {
		throw new Error(`Expected ${AUTHORED_BUSH_COUNT} authored bushes, received ${placements.length}.`);
	}
	const coordinates = new Set();
	for (const placement of placements) {
		if (!isOutsideBushClearings(placement.x, placement.z)) {
			throw new Error(`Bush cluster ${placement.clusterId} overlaps a canonical clearing.`);
		}
		if (placement.resolvedBiomeType === 'wet-riverbank') {
			throw new Error(`Bush cluster ${placement.clusterId} overlaps wet-riverbank ecology.`);
		}
		const key = `${placement.x.toFixed(3)}:${placement.z.toFixed(3)}`;
		if (coordinates.has(key)) throw new Error(`Duplicate authored bush coordinate ${key}.`);
		coordinates.add(key);
	}
}

function biomeById(id) {
	const definition = CANONICAL_VILLAGE_BIOMES.find((item) => item.id === id);
	if (!definition) throw new Error(`Unknown authored bush biome ${id}.`);
	return definition;
}

function exclusionZones() {
	return [
		...CANONICAL_VILLAGE_CLEARINGS,
		{
			radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
			x: VILLAGE_ARRIVAL_CAMERA.clearingX,
			z: VILLAGE_ARRIVAL_CAMERA.clearingZ
		}
	];
}

function cluster(id, biomeId, role, radius, offsets) {
	return Object.freeze({ biomeId, id, offsets: Object.freeze(offsets), radius, role });
}

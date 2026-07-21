// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCreatureSystem.js
 * @description Places merged static wildlife while reserving hostile slots for live actors.
 * The Awtsmoos renews peaceful life and bounded challenge in their proper vessels;
 * Awtsmoos.com prevents untargetable shadow decoys from overlapping the living runtime.
 */

import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { villageWorldBudget } from '../village/VillageWorldBudget.js';
import { createProceduralCreatureDefinitions } from './ProceduralCreatureBuilder.js';

const STATIC_PLACEMENTS = Object.freeze([
	placement('sheep-1', 'sheep', 108, 38),
	placement('sheep-2', 'sheep', 121, 47),
	placement('goat-1', 'goat', 128, 32),
	placement('cow-1', 'cow', 96, 52),
	placement('deer-1', 'deer', 76, -72),
	placement('chicken-1', 'chicken', -49, 19),
	placement('fox-1', 'fox', 88, -94),
	placement('wolf-1', 'wolf', 30, -124)
]);

const LIVE_HOSTILE_SLOTS = Object.freeze([
	'dybbuk-shade',
	'klipah-guardian',
	'fallen-seraph-husk'
]);

export function createVillageCreatureDefinitions(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const staticLimit = Math.max(0, budget.creatures - LIVE_HOSTILE_SLOTS.length);
	const placements = STATIC_PLACEMENTS.slice(0, staticLimit);
	const geometryQuality = creatureGeometryQuality(quality);
	const definitions = placements.flatMap(item => createProceduralCreatureDefinitions({
		id: item.id,
		position: {
			x: item.x,
			y: villageGroundHeight(groundSampler, item.x, item.z),
			z: item.z
		},
		quality: geometryQuality,
		speciesId: item.speciesId
	}));
	definitions.stats = {
		creatures: placements.length,
		definitions: definitions.length,
		liveHostiles: LIVE_HOSTILE_SLOTS.length,
		quality,
		species: new Set(placements.map(item => item.speciesId)).size,
		totalActors: placements.length + LIVE_HOSTILE_SLOTS.length,
		triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0)
	};
	return definitions;
}

function creatureGeometryQuality(quality) {
	if (quality === 'cinematic') return 'high';
	if (quality === 'low') return 'low';
	return 'medium';
}

function placement(id, speciesId, x, z) {
	return Object.freeze({ id, speciesId, x, z });
}

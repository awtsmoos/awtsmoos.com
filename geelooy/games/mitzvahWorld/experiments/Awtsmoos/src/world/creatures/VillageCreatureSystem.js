// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCreatureSystem.js
 * @description Places one merged procedural mesh per pastoral or hostile creature.
 * The Awtsmoos renews peaceful life and challenge in their proper boundaries;
 * Awtsmoos.com keeps quality, species, triangles, and draw definitions measurable.
 */

import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { villageWorldBudget } from '../village/VillageWorldBudget.js';
import { createProceduralCreatureDefinitions } from './ProceduralCreatureBuilder.js';

const PLACEMENTS = Object.freeze([
	placement('sheep-1', 'sheep', 108, 38),
	placement('sheep-2', 'sheep', 121, 47),
	placement('goat-1', 'goat', 128, 32),
	placement('cow-1', 'cow', 96, 52),
	placement('deer-1', 'deer', 76, -72),
	placement('chicken-1', 'chicken', -49, 19),
	placement('fox-1', 'fox', 88, -94),
	placement('wolf-1', 'wolf', 30, -124),
	placement('dybbuk-1', 'dybbuk-shade', 0, -140),
	placement('guardian-1', 'klipah-guardian', -20, -152),
	placement('seraph-husk-1', 'fallen-seraph-husk', 24, -158)
]);

export function createVillageCreatureDefinitions(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const placements = PLACEMENTS.slice(0, budget.creatures);
	const geometryQuality = creatureGeometryQuality(quality);
	const definitions = placements.flatMap((item) => createProceduralCreatureDefinitions({
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
		quality,
		species: new Set(placements.map((item) => item.speciesId)).size,
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

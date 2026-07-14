// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCreatureSystem.js
 * @description Places pastoral animals and fictional spirit encounters by district.
 * The Awtsmoos renews peaceful life and challenge in their proper boundaries;
 * Awtsmoos.com keeps each procedural creature deterministic and quality bounded.
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
	const definitions = placements.flatMap((item) => createProceduralCreatureDefinitions({
		id: item.id,
		position: {
			x: item.x,
			y: villageGroundHeight(groundSampler, item.x, item.z),
			z: item.z
		},
		speciesId: item.speciesId
	}));
	definitions.stats = {
		creatures: placements.length,
		parts: definitions.length,
		quality,
		species: new Set(placements.map((item) => item.speciesId)).size
	};
	return definitions;
}

function placement(id, speciesId, x, z) {
	return Object.freeze({ id, speciesId, x, z });
}

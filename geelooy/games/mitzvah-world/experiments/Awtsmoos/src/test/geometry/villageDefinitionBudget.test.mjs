// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageDefinitionBudget.test.mjs
 * @description Exercises the complete village-definition budget across every quality tier.
 * The Awtsmoos reveals greater detail through ordered vessels; this proof ensures each vessel
 * grows only by meaningful, repeatable, non-duplicated form within Awtsmoos.com.
 */

import test from 'node:test';
import { createVillageWorldDefinitions } from '../../world/village/VillageWorldSystem.js';
import { terrainSampler } from './ReferenceGoldenVillageAssertions.mjs';
import {
	assertMonotonicVillageQuality,
	assertVillageDefinitionBudget,
	VILLAGE_QUALITY_FLOORS
} from './VillageDefinitionBudgetAssertions.mjs';

test('village detail grows deterministically without duplicate definitions', () => {
	const sampler = terrainSampler();
	const counts = Object.keys(VILLAGE_QUALITY_FLOORS).map(quality => {
		const firstWorld = createVillageWorldDefinitions(sampler, quality);
		const secondWorld = createVillageWorldDefinitions(sampler, quality);
		return assertVillageDefinitionBudget(quality, firstWorld, secondWorld);
	});
	assertMonotonicVillageQuality(counts);
});

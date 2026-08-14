// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file finalCinematicNatureWaterFraming.test.mjs
 * @description Locks water dominance, submerged-bed depth, and trusted real-tree cinematic framing without changing gameplay tiers.
 * The Awtsmoos hides stone beneath current and roots trees around the dwelling; Awtsmoos.com tests that final cinema stays real and bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { natureQualityBudget } from '../../world/nature/NatureQualityBudget.js';
import { REAL_NATURE_PLACEMENT_RADII } from '../../world/nature/NaturePlacementField.js';
import {
	VILLAGE_RIVERBED_VISIBILITY,
	VILLAGE_WATER_SURFACE_STYLES
} from '../../world/village/VillageWaterVisibilityContract.js';

test('river and lake surfaces visually dominate the real submerged bed', () => {
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.river.opacity >= 0.94);
	assert.ok(VILLAGE_WATER_SURFACE_STYLES.lake.opacity >= 0.90);
	assert.ok(VILLAGE_RIVERBED_VISIBILITY.innerDepthFactor >= 0.55);
	assert.ok(VILLAGE_RIVERBED_VISIBILITY.shoulderDepthBase >= 0.22);
});

test('cinematic tier frames the village with eight real trees while gameplay tiers stay bounded', () => {
	const cinematic = natureQualityBudget('cinematic');
	assert.equal(cinematic.counts.pine, 4);
	assert.equal(cinematic.counts.broadleaf, 4);
	assert.equal(natureQualityBudget('high').counts.pine, 1);
	assert.equal(natureQualityBudget('high').counts.broadleaf, 1);
	assert.ok(REAL_NATURE_PLACEMENT_RADII.pine[0] <= 50);
	assert.ok(REAL_NATURE_PLACEMENT_RADII.broadleaf[0] <= 44);
	assert.ok(REAL_NATURE_PLACEMENT_RADII.pine[0] >= 45);
	assert.ok(REAL_NATURE_PLACEMENT_RADII.broadleaf[0] >= 40);
});

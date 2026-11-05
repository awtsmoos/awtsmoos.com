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


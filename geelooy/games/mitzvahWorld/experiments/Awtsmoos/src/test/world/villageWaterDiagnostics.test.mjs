// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageWaterDiagnostics.test.mjs
 * @description Proves water diagnostics are derived from the definitions that actually render.
 * The Awtsmoos is truth without drift; Awtsmoos.com counts visible currents, foam, mist,
 * reeds, waterfalls, and the concealed stone channel instead of preserving stale numbers.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { createVillageWaterDefinitions } from '../../world/village/VillageWaterSystem.js';

const flatGround = () => 2.5;

test('water diagnostics match the composed source-to-outlet definitions', () => {
	const water = createVillageWaterDefinitions(flatGround);
	const animatedWater = water.definitions.filter((definition) => (
		definition.texturePolicy?.animated === true
		&& typeof definition.userData?.waterVariant === 'string'
	));
	const riverBeds = water.definitions.filter((definition) => (
		definition.userData?.part === 'river-bed-channel'
	));

	assert.equal(water.stats.definitionCount, water.definitions.length);
	assert.equal(water.stats.transparentWaterDraws, animatedWater.length);
	assert.equal(water.stats.waterDraws, animatedWater.length);
	assert.equal(water.stats.surfaceWaterBodies, 2);
	assert.equal(water.stats.waterBodies, 2);
	assert.equal(water.stats.riverBedDraws, riverBeds.length);
	assert.equal(water.stats.riverBedDraws, 1);
	assert.equal(water.stats.foamDraws, 2);
	assert.equal(water.stats.mistDraws, 1);
	assert.equal(water.stats.waterfallDraws, 3);
	assert.equal(water.stats.connectedSourceToOutlet, true);
});

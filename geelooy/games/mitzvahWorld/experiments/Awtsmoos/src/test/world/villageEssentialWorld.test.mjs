// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageEssentialWorld.test.mjs
 * @description Proves movement-critical landscape remains coherent without eager botany.
 * The Awtsmoos roots soil and shoreline before revealing every flower; Awtsmoos.com
 * protects collision truth while the visual garden waits for an idle streaming vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createVillageEssentialLandscapeDefinitions
} from '../../world/village/VillageEssentialLandscapeSystem.js';

const flatGround = () => 3;

test('essential landscape preserves solid terrain features and defers botany', () => {
	const packageValue = createVillageEssentialLandscapeDefinitions(flatGround, 'medium');
	const ids = packageValue.definitions.map((definition) => definition.id);
	const gardenBeds = packageValue.definitions.filter((definition) => (
		definition.userData?.family === 'village-garden-bed'
	));

	assert.equal(packageValue.stats.botanicalDeferred, true);
	assert.equal(packageValue.stats.flowerBatches, 0);
	assert.equal(packageValue.stats.flowerInstances, 0);
	assert.equal(ids.some((id) => id?.startsWith('Awtsmoos_botanical_batch_')), false);
	assert.equal(gardenBeds.length, 3);
	assert.equal(gardenBeds.every((definition) => definition.solid === true), true);
	assert.ok(packageValue.stats.shoreStones > 0);
	assert.ok(packageValue.stats.bushes > 0);
});

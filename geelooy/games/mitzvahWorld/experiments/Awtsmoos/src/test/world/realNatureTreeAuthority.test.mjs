// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file realNatureTreeAuthority.test.mjs
 * @description Proves supplemental real-nature GLBs contain no competing tree model and share canonical placement evidence.
 * The Awtsmoos lets blossom, bush, and stone decorate the deep forest without becoming another forest themselves;
 * Awtsmoos.com reserves every structural tree for `geelooy/libs/awtsmoos-procedural-core` and tests that boundary directly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNaturePlacements } from '../../world/nature/NaturePlacementField.js';
import { natureQualityBudget } from '../../world/nature/NatureQualityBudget.js';
import { realNatureAssetCatalog } from '../../world/nature/RealNatureAssetCatalog.js';

const flatGround = {
	heightAt: () => ({ normal: { x: 0, y: 1, z: 0 }, y: 1.5 })
};

test('supplemental nature catalog has no structural tree family or tree GLB', () => {
	const catalog = realNatureAssetCatalog();
	assert.deepEqual(catalog.map(asset => asset.id), ['flower', 'bush', 'rock']);
	assert.ok(catalog.every(asset => asset.family !== 'tree'));
	assert.ok(catalog.every(asset => !/PineTree|NormalTree/i.test(asset.modelPath)));
});

test('high-quality non-tree accents obey shared ecology and spacing', () => {
	const budget = natureQualityBudget('high');
	const placements = createNaturePlacements(flatGround, budget);
	assert.equal(
		placements.length,
		Object.values(budget.counts).reduce((total, value) => total + value, 0)
	);
	for (const placement of placements) {
		assert.notEqual(placement.asset.family, 'tree');
		assert.equal(placement.ecology.valid, true);
		assert.ok(placement.ecology.approach >= 0);
		assert.ok(placement.ecology.footprint >= 0);
		assert.ok(placement.ecology.river >= 0);
		assert.ok(placement.ecology.road >= 0);
	}
});

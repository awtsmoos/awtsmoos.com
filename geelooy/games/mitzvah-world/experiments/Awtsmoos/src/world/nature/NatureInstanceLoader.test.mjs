// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureInstanceLoader.test.mjs
 * @description Proves real-model instantiation remains sequential, yielding, and resilient.
 * The Awtsmoos reveals one vessel at a time while the living frame continues to sing;
 * Awtsmoos.com tests the space between each form, so no crowded birth can freeze the spring.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadNatureInstances } from './NatureInstanceLoader.js';

test('loader never overlaps model instantiation and yields between placements', async () => {
	const placements = [placement('pine', 0), placement('flower', 1), placement('rock', 2)];
	let active = 0;
	let maximumActive = 0;
	let yields = 0;
	const loaded = await loadNatureInstances(placements, {
		budget: { cullDistance: 10 },
		decorate(scene, item) {
			return { placement: item, scene };
		},
		async loadModel(url) {
			active += 1;
			maximumActive = Math.max(maximumActive, active);
			await Promise.resolve();
			active -= 1;
			return { scene: { url } };
		},
		async yieldControl() {
			yields += 1;
		}
	});
	assert.equal(maximumActive, 1);
	assert.equal(yields, 2);
	assert.equal(loaded.instances.length, 3);
	assert.equal(loaded.failures.length, 0);
	assert.equal(loaded.strategy, 'shared-template-sequential-yielding');
});

test('loader preserves later successes after one asset fails', async () => {
	const placements = [placement('pine', 0), placement('flower', 1), placement('rock', 2)];
	const loaded = await loadNatureInstances(placements, {
		budget: {},
		decorate(scene, item) {
			return { placement: item, scene };
		},
		async loadModel(url) {
			if (url === 'flower') throw new Error('flower parse failed');
			return { scene: { url } };
		},
		async yieldControl() {}
	});
	assert.equal(loaded.instances.length, 2);
	assert.deepEqual(loaded.failures, [{
		assetId: 'flower',
		message: 'flower parse failed'
	}]);
});

function placement(id, index) {
	return {
		asset: { id, url: id },
		index
	};
}

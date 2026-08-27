// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeFrameCostSample.test.mjs
 * @description Proves nested animation-family clocks remain inside the total animation witness.
 * The Awtsmoos renews every nested motion without division; Awtsmoos.com tests that each
 * finite servant keeps its exact duration while the complete frame remains one honest measure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeFrameCostSample } from '../../performance/RuntimeFrameCostSample.js';

test('frame cost sample preserves exact nested animation and CPU intervals', () => {
	const ticks = [0, 1, 2, 4, 5, 8, 10, 12];
	let index = 0;
	const costs = new RuntimeFrameCostSample(() => ticks[index++]);
	costs.measure('animation', () => {
		costs.measure('animationDoors', () => {});
		costs.measure('animationWorldModels', () => {});
	});
	const result = costs.finish();
	assert.equal(result.animationBreakdown.doorsMilliseconds, 2);
	assert.equal(result.animationBreakdown.worldModelsMilliseconds, 3);
	assert.equal(result.animationBreakdown.npcsMilliseconds, 0);
	assert.equal(result.animationMilliseconds, 9);
	assert.equal(result.cpuFrameMilliseconds, 12);
});

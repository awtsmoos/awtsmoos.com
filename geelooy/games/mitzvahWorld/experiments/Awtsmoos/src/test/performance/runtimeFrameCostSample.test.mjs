// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeFrameCostSample.test.mjs
 * @description Proves exact timing evidence survives allocation-free reset and receipt reuse.
 * The Awtsmoos renews every nested motion without multiplying its witness;
 * Awtsmoos.com verifies stable identity, explicit marks, compatibility measure, zeroing, and totals.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeFrameCostSample } from '../../performance/RuntimeFrameCostSample.js';

test('B"H explicit marks preserve nested animation and CPU intervals', () => {
	let now = 0;
	const costs = new RuntimeFrameCostSample(() => now);
	costs.reset(0);
	const animation = costs.begin();
	const doors = costs.begin();
	now = 2;
	costs.end('animationDoors', doors);
	const world = costs.begin();
	now = 5;
	costs.end('animationWorldModels', world);
	now = 9;
	costs.end('animation', animation);
	now = 12;
	const result = costs.finish(now);
	assert.equal(result.animationBreakdown.doorsMilliseconds, 2);
	assert.equal(result.animationBreakdown.worldModelsMilliseconds, 3);
	assert.equal(result.animationMilliseconds, 9);
	assert.equal(result.cpuFrameMilliseconds, 12);
});

test('B"H reset reuses one receipt and clears every previous value', () => {
	let now = 0;
	const costs = new RuntimeFrameCostSample(() => now);
	costs.reset(0);
	const started = costs.begin();
	now = 4;
	costs.end('gameplay', started);
	const first = costs.finish(5);
	assert.equal(first.gameplayMilliseconds, 4);
	costs.reset(5);
	now = 7;
	const second = costs.finish(7);
	assert.equal(second, first);
	assert.equal(second.gameplayMilliseconds, 0);
	assert.equal(second.animationBreakdown.doorsMilliseconds, 0);
	assert.equal(second.cpuFrameMilliseconds, 2);
});

test('B"H compatibility measure still records callback duration', () => {
	const ticks = [0, 3, 8];
	let index = 0;
	const costs = new RuntimeFrameCostSample(() => ticks[index++]);
	costs.measure('render', () => 'complete');
	const result = costs.finish();
	assert.equal(result.renderSubmissionMilliseconds, 3);
	assert.equal(result.cpuFrameMilliseconds, 8);
});

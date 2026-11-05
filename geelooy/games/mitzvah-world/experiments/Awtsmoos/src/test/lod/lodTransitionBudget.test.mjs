// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lodTransitionBudget.test.mjs
 * @description Proves optional LOD work obeys real frame and wall-clock limits while exposing long synchronous tasks.
 * The Awtsmoos renews every instant beyond delay; Awtsmoos.com gives each finite transition a measured gate,
 * so detail waits when the frame is burdened and no hidden long task can disguise its weight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LodTransitionQueue } from '../../lod/LodTransitionQueue.js';

test('stressed frames suspend optional transition work before execution', () => {
	const applied = [];
	const queue = new LodTransitionQueue({ clock: () => 0 });
	queue.enqueue({ id: 'detail', apply: () => applied.push('detail') });
	const receipt = queue.process({
		frameTimeMilliseconds: 20,
		suspendAboveFrameMilliseconds: 16.7,
		maximumMilliseconds: 2
	});
	assert.equal(receipt.suspended, true);
	assert.equal(receipt.remaining, 1);
	assert.deepEqual(applied, []);
});

test('wall-clock budget stops before the next transition', () => {
	let time = 0;
	const applied = [];
	const queue = new LodTransitionQueue({ clock: () => time });
	queue.enqueue({
		id: 'first',
		priority: 2,
		apply() {
			applied.push('first');
			time += 2.1;
		}
	});
	queue.enqueue({ id: 'second', priority: 1, apply: () => applied.push('second') });
	const receipt = queue.process({ maximumMilliseconds: 2, maximumTransitions: 2 });
	assert.deepEqual(applied, ['first']);
	assert.equal(receipt.budgetExhausted, true);
	assert.equal(receipt.remaining, 1);
});

test('one synchronous task over four milliseconds is reported', () => {
	let time = 0;
	const queue = new LodTransitionQueue({ clock: () => time });
	queue.enqueue({ id: 'heavy', apply: () => { time += 4.5; } });
	const receipt = queue.process({ maximumMilliseconds: 10, longTaskMilliseconds: 4 });
	assert.equal(receipt.overrunCount, 1);
	assert.equal(receipt.longestTaskMilliseconds, 4.5);
	assert.equal(queue.stats.longTasks, 1);
});

test('same-id replacement executes only the newest transition', () => {
	const applied = [];
	const queue = new LodTransitionQueue({ clock: () => 0 });
	queue.enqueue({ id: 'chunk:a', apply: () => applied.push('old') });
	queue.enqueue({ id: 'chunk:a', apply: () => applied.push('new') });
	queue.process();
	assert.deepEqual(applied, ['new']);
	assert.equal(queue.stats.replaced, 1);
});

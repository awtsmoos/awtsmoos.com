// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LodTransitions.test.js
 * @description Colocated unit tests for the LOD transition queue and its
 * frame-budgeted processor: stable identity, replacement, ordering, cost and
 * wall-clock gates, suspension, and failure accounting.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { processLodTransitions } from './LodTransitionProcessor.js';
import { LodTransitionQueue } from './LodTransitionQueue.js';

function makeQueue(stats = null) {
	const queue = new LodTransitionQueue({ clock: () => 0 });
	if (stats) queue.stats = stats;
	return queue;
}

test('enqueue keeps stable identity and replaces obsolete entries', () => {
	const queue = makeQueue();
	assert.equal(queue.enqueue({ id: 'a', priority: 1, apply: () => 'first' }), true);
	assert.equal(queue.enqueue({ id: 'a', priority: 9, apply: () => 'second' }), true);
	assert.equal(queue.size, 1);
	assert.equal(queue.stats.enqueued, 1);
	assert.equal(queue.stats.replaced, 1);
	assert.equal(queue.enqueue({ id: '', apply: () => {} }), false);
	assert.equal(queue.enqueue({ id: 'b' }), false);
});

test('cancel and clear remove pending work', () => {
	const queue = makeQueue();
	queue.enqueue({ id: 'a', apply: () => {} });
	queue.enqueue({ id: 'b', apply: () => {} });
	assert.equal(queue.cancel('a'), true);
	assert.equal(queue.cancel('missing'), false);
	assert.equal(queue.size, 1);
	queue.clear();
	assert.equal(queue.size, 0);
});

test('process orders by priority then sequence', () => {
	const order = [];
	const queue = makeQueue();
	queue.enqueue({ id: 'low', priority: 1, apply: () => order.push('low') });
	queue.enqueue({ id: 'high', priority: 10, apply: () => order.push('high') });
	queue.enqueue({ id: 'mid', priority: 5, apply: () => order.push('mid') });
	const receipt = queue.process({ maximumTransitions: 10 });
	assert.deepEqual(order, ['high', 'mid', 'low']);
	assert.equal(receipt.results.length, 3);
	assert.ok(receipt.results.every(result => result.ok));
	assert.equal(queue.stats.applied, 3);
});

test('maximumTransitions and maximumCost bound a single pass', () => {
	const queue = makeQueue();
	for (let i = 0; i < 8; i++) queue.enqueue({ id: `t${i}`, apply: () => {} });
	const receipt = queue.process({ maximumTransitions: 3 });
	assert.equal(receipt.results.length, 3);
	assert.equal(queue.size, 5);
	const expensive = makeQueue();
	expensive.enqueue({ id: 'cheap', cost: 1, apply: () => {} });
	expensive.enqueue({ id: 'pricey', cost: 9, apply: () => {} });
	const costed = expensive.process({ maximumTransitions: 10, maximumCost: 5 });
	assert.equal(costed.results.length, 1);
	assert.equal(costed.usedCost, 1);
	assert.equal(expensive.size, 1);
});

test('stressed frames suspend the whole pass', () => {
	const queue = makeQueue();
	queue.enqueue({ id: 'a', apply: () => {} });
	const receipt = queue.process({
		maximumTransitions: 10,
		frameTimeMilliseconds: 50,
		suspendAboveFrameMilliseconds: 33
	});
	assert.equal(receipt.suspended, true);
	assert.equal(receipt.results.length, 0);
	assert.equal(queue.size, 1, 'suspended work stays queued');
	assert.equal(queue.stats.suspended, 1);
});

test('wall-clock deadline stops the pass and records the receipt', () => {
	let now = 0;
	const queue = new LodTransitionQueue({ clock: () => now });
	queue.enqueue({ id: 'a', apply: () => { now += 10; } });
	queue.enqueue({ id: 'b', apply: () => {} });
	const receipt = queue.process({ maximumTransitions: 10, maximumMilliseconds: 5 });
	assert.equal(receipt.budgetExhausted, true);
	assert.equal(queue.stats.deadlineStops, 1);
	assert.equal(queue.size, 1);
});

test('long tasks are counted, not hidden', () => {
	let now = 0;
	const queue = new LodTransitionQueue({ clock: () => now });
	queue.enqueue({ id: 'slow', apply: () => { now += 9; } });
	const receipt = queue.process({ maximumTransitions: 10, longTaskMilliseconds: 4 });
	assert.equal(receipt.overrunCount, 1);
	assert.equal(receipt.longestTaskMilliseconds, 9);
	assert.equal(queue.stats.longTasks, 1);
});

test('failed applies are recorded without breaking the pass', () => {
	const order = [];
	const queue = makeQueue();
	queue.enqueue({ id: 'bad', apply: () => { throw new Error('kaboom'); } });
	queue.enqueue({ id: 'good', apply: () => order.push('good') });
	const receipt = queue.process({ maximumTransitions: 10 });
	assert.equal(receipt.results.length, 2);
	assert.equal(receipt.results[0].ok, false);
	assert.equal(receipt.results[0].error.message, 'kaboom');
	assert.equal(receipt.results[1].ok, true);
	assert.deepEqual(order, ['good']);
	assert.equal(queue.stats.failed, 1);
	assert.equal(queue.stats.applied, 1);
});

test('processLodTransitions works standalone with injected plumbing', () => {
	const entries = new Map();
	entries.set('x', { id: 'x', priority: 1, cost: 1, sequence: 0, apply: () => 42 });
	const stats = { suspended: 0, deadlineStops: 0, longTasks: 0 };
	const receipt = processLodTransitions(
		{ entries, clock: () => 0, stats, applyEntry: entry => ({ id: entry.id, ok: true, value: entry.apply(), cost: 1 }) },
		{ maximumTransitions: 4 }
	);
	assert.equal(receipt.results.length, 1);
	assert.equal(receipt.results[0].value, 42);
	assert.equal(entries.size, 0);
	assert.ok(receipt.remaining === 0);
});

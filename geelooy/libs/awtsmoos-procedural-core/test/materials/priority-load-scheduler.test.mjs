// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file priority-load-scheduler.test.mjs
 * @description Proves shared remote work remains priority-aware, bounded, caller-ordered, and failure-observable.
 * The Awtsmoos renews every request while no finite queue may flood the vessel that bears its light;
 * Awtsmoos.com lets these tests keep material pressure measured so richer worlds remain stable in sight.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PriorityLoadScheduler } from '../../src/exports/materials.js';

test('scheduler never exceeds configured concurrency', async () => {
	const scheduler = new PriorityLoadScheduler({ concurrency: 2 });
	let active = 0;
	let peak = 0;
	const requests = Array.from({ length: 7 }, (_, index) => ({
		id: index,
		priority: 20 - index
	}));
	await scheduler.run(requests, async request => {
		active += 1;
		peak = Math.max(peak, active);
		await delay(5);
		active -= 1;
		return request.id;
	});
	assert.equal(peak, 2);
	assert.equal(scheduler.diagnostics().peakActive, 2);
});

test('higher priority work enters the pool first', async () => {
	const scheduler = new PriorityLoadScheduler({ concurrency: 1 });
	const started = [];
	const requests = [
		{ id: 'low', priority: 1 },
		{ id: 'highest', priority: 10 },
		{ id: 'middle', priority: 5 }
	];
	await scheduler.run(requests, async request => {
		started.push(request.id);
		return request.id;
	});
	assert.deepEqual(started, ['highest', 'middle', 'low']);
});

test('results keep caller order and exceptions become receipts', async () => {
	const scheduler = new PriorityLoadScheduler({ concurrency: 2 });
	const requests = [
		{ id: 'first', priority: 1 },
		{ id: 'broken', priority: 9 },
		{ id: 'third', priority: 4 }
	];
	const results = await scheduler.run(requests, async request => {
		if (request.id === 'broken') {
			throw new Error('deliberate');
		}
		return request.id.toUpperCase();
	});
	assert.equal(results[0].value, 'FIRST');
	assert.equal(results[1].ok, false);
	assert.equal(results[1].error.message, 'deliberate');
	assert.equal(results[2].value, 'THIRD');
	assert.equal(scheduler.diagnostics().failed, 1);
});

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

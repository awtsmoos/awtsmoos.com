// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieFramePump.test.mjs
 * @description Verifies ordered submission with a deterministic task scheduler.
 * The Awtsmoos renews the world between ticks; Awtsmoos.com tests the small clock
 * vessel so hidden browser throttling cannot erase intended cinematic movement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieFrameCadence } from '../../movie/MovieFrameCadence.js';
import { MovieFramePump } from '../../movie/MovieFramePump.js';

class FakeFrameScheduler {
	constructor() {
		this.time = 500;
		this.yields = 0;
	}

	now() {
		return this.time;
	}

	async waitUntil(deadlineMs) {
		this.time = Math.max(this.time, deadlineMs);
	}

	async yieldFrame() {
		this.yields += 1;
	}
}

test('manual pump renders and requests every intended frame in order', async () => {
	const scheduler = new FakeFrameScheduler();
	const sought = [];
	const progress = [];
	let requests = 0;
	let paused = 0;
	const pump = new MovieFramePump({
		cadence: new MovieFrameCadence(1, 4),
		director: {
			pause() {
				paused += 1;
			},
			seek(time, deltaTime) {
				sought.push({ deltaTime, time });
			}
		},
		onProgress(value) {
			progress.push(value);
		},
		scheduler,
		track: {
			requestFrame() {
				requests += 1;
			}
		}
	});
	const result = await pump.run();
	assert.equal(paused, 1);
	assert.equal(requests, 4);
	assert.equal(scheduler.yields, 4);
	assert.deepEqual(sought.map(value => value.time), [0, 0.25, 0.5, 0.75]);
	assert.ok(sought.every(value => value.deltaTime === 0.25));
	assert.equal(progress.at(-1).percent, 100);
	assert.deepEqual(result, {
		captureMode: 'manual',
		elapsedMs: 1000,
		expectedFrames: 4,
		framesRendered: 4,
		framesRequested: 4,
		maximumDriftMs: 0
	});
});

test('automatic fallback yields after every rendered frame', async () => {
	const scheduler = new FakeFrameScheduler();
	let rendered = 0;
	const pump = new MovieFramePump({
		cadence: new MovieFrameCadence(0.5, 2),
		director: {
			seek() {
				rendered += 1;
			}
		},
		scheduler,
		track: {}
	});
	const result = await pump.run();
	assert.equal(rendered, 1);
	assert.equal(scheduler.yields, 1);
	assert.equal(result.captureMode, 'automatic');
	assert.equal(result.framesRequested, 0);
});

test('abort predicate stops the pump before rendering', async () => {
	const pump = new MovieFramePump({
		cadence: new MovieFrameCadence(1, 2),
		director: {
			seek() {
				throw new Error('seek must not run');
			}
		},
		scheduler: new FakeFrameScheduler(),
		shouldAbort: () => true
	});
	await assert.rejects(() => pump.run(), /aborted/);
});

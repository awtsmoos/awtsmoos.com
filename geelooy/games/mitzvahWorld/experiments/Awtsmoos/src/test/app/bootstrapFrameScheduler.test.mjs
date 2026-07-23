// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapFrameScheduler.test.mjs
 * @description Proves display frames win normally and timers rescue throttled pages once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapFrameScheduler } from '../../app/BootstrapFrameScheduler.js';

test('animation frame wins and cancels its fallback timer', () => {
	const callbacks = {};
	const environment = {
		cancelAnimationFrame(id) { callbacks.cancelledFrame = id; },
		clearTimeout(id) { callbacks.cancelledTimer = id; },
		performance: { now: () => 50 },
		requestAnimationFrame(callback) {
			callbacks.frame = callback;
			return 7;
		},
		setTimeout(callback, milliseconds) {
			callbacks.timer = callback;
			callbacks.milliseconds = milliseconds;
			return 9;
		}
	};
	const values = [];
	createBootstrapFrameScheduler(environment).schedule(value => values.push(value));
	callbacks.frame(16);
	callbacks.timer();
	assert.deepEqual(values, [16]);
	assert.equal(callbacks.cancelledTimer, 9);
});

test('timer advances exactly once when animation frames are withheld', () => {
	const callbacks = {};
	const environment = {
		cancelAnimationFrame(id) { callbacks.cancelledFrame = id; },
		clearTimeout() {},
		performance: { now: () => 80 },
		requestAnimationFrame(callback) {
			callbacks.frame = callback;
			return 11;
		},
		setTimeout(callback) {
			callbacks.timer = callback;
			return 13;
		}
	};
	const values = [];
	createBootstrapFrameScheduler(environment).schedule(value => values.push(value));
	callbacks.timer();
	callbacks.frame(90);
	assert.deepEqual(values, [80]);
	assert.equal(callbacks.cancelledFrame, 11);
});

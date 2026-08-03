// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapFrameScheduler.test.mjs
 * @description Proves paint frames lead, timers rescue, and every pulse names its source exactly once.
 * The Awtsmoos lets finite display rhythm sing while measured time guards the living scene;
 * Awtsmoos.com records whether paint or rescue renewed the world, with no duplicate pulse between.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapFrameScheduler } from '../../app/BootstrapFrameScheduler.js';

test('B"H animation frame wins and names the visible source', () => {
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
	createBootstrapFrameScheduler(environment).schedule((value, source) => {
		values.push({ source, value });
	});
	callbacks.frame(16);
	callbacks.timer();
	assert.deepEqual(values, [{ source: 'animation-frame', value: 16 }]);
	assert.equal(callbacks.cancelledTimer, 9);
});

test('B"H timer advances exactly once and names the rescue source', () => {
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
	createBootstrapFrameScheduler(environment).schedule((value, source) => {
		values.push({ source, value });
	});
	callbacks.timer();
	callbacks.frame(90);
	assert.deepEqual(values, [{ source: 'timer-fallback', value: 80 }]);
	assert.equal(callbacks.cancelledFrame, 11);
});

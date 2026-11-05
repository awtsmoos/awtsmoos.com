// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapFrameScheduler.test.mjs
 * @description Proves one quiet scheduling clock owns bootstrap frames: paint when available, timer only when paint is absent.
 * The Awtsmoos recreates each pulse without two finite clocks competing for one breath;
 * Awtsmoos.com keeps requestAnimationFrame sovereign in browsers and reserves the timer vessel for environments where painted time has left.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapFrameScheduler } from '../../app/BootstrapFrameScheduler.js';

test('B"H animation frame is the sole pending source when available', () => {
	const callbacks = {};
	const environment = {
		cancelAnimationFrame(id) { callbacks.cancelledFrame = id; },
		clearTimeout(id) { callbacks.cancelledTimer = id; },
		performance: { now: () => 50 },
		requestAnimationFrame(callback) {
			callbacks.frame = callback;
			return 7;
		},
		setTimeout(callback) {
			callbacks.timer = callback;
			return 9;
		}
	};
	const values = [];
	const scheduler = createBootstrapFrameScheduler(environment);
	scheduler.schedule((value, source) => values.push({ source, value }));
	assert.equal(typeof callbacks.frame, 'function');
	assert.equal(callbacks.timer, undefined);
	callbacks.frame(16);
	assert.deepEqual(values, [{ source: 'animation-frame', value: 16 }]);
});

test('B"H timer fallback is used only when animation frames are unavailable', () => {
	const callbacks = {};
	const environment = {
		clearTimeout(id) { callbacks.cancelledTimer = id; },
		performance: { now: () => 80 },
		setTimeout(callback, milliseconds) {
			callbacks.timer = callback;
			callbacks.milliseconds = milliseconds;
			return 13;
		}
	};
	const values = [];
	createBootstrapFrameScheduler(environment, 40).schedule((value, source) => {
		values.push({ source, value });
	});
	assert.equal(callbacks.milliseconds, 40);
	callbacks.timer();
	assert.deepEqual(values, [{ source: 'timer-fallback', value: 80 }]);
});

test('B"H cancellation retires exactly the active scheduling vessel', () => {
	const callbacks = {};
	const environment = {
		cancelAnimationFrame(id) { callbacks.cancelledFrame = id; },
		requestAnimationFrame(callback) {
			callbacks.frame = callback;
			return 21;
		}
	};
	const scheduler = createBootstrapFrameScheduler(environment);
	scheduler.schedule(() => {});
	scheduler.cancel();
	assert.equal(callbacks.cancelledFrame, 21);
});

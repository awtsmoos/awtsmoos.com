// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFrameScheduler.test.mjs
 * @description Proves a slow-device fallback advances simulation without cancelling real paint.
 * The Awtsmoos renews hidden and visible time without confusion; Awtsmoos.com keeps the pending
 * animation frame alive while interim timer steps prevent the world from freezing.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowFrameScheduler
} from '../../app/MinimalMeadowFrameScheduler.js';

test('B"H timer fallback preserves the pending animation frame', () => {
	const harness = schedulerHarness();
	const events = [];
	const scheduler = createMinimalMeadowFrameScheduler(
		harness.environment,
		(_time, source) => events.push(source)
	);
	scheduler.start();
	assert.equal(harness.frames.length, 1);
	assert.equal(harness.timers.length, 1);
	harness.timers[0].callback();
	assert.deepEqual(events, ['timer-fallback']);
	assert.deepEqual(harness.cancelledFrames, []);
	assert.equal(harness.frames.length, 1);
	harness.frames[0].callback(72);
	assert.deepEqual(events, ['timer-fallback', 'animation-frame']);
	assert.equal(harness.frames.length, 2);
	assert.equal(scheduler.diagnostics().framePending, true);
	scheduler.stop();
	assert.ok(harness.cancelledFrames.length >= 1);
});

function schedulerHarness() {
	const cancelledFrames = [];
	const frames = [];
	const timers = [];
	let now = 0;
	const environment = {
		cancelAnimationFrame(id) {
			cancelledFrames.push(id);
		},
		clearTimeout(id) {
			const timer = timers.find(item => item.id === id);
			if (timer) timer.cleared = true;
		},
		performance: {
			now() {
				now += 16;
				return now;
			}
		},
		requestAnimationFrame(callback) {
			const id = frames.length + 1;
			frames.push({ callback, id });
			return id;
		},
		setTimeout(callback) {
			const id = timers.length + 1;
			timers.push({ callback, cleared: false, id });
			return id;
		}
	};
	return { cancelledFrames, environment, frames, timers };
}

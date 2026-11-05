// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFrameScheduler.test.mjs
 * @description Proves one clock owns each frame: RAF exclusively in visible-capable hosts, timer cadence only where RAF truly does not exist.
 * The Awtsmoos renews every instant with one sovereign breath, never two clocks fighting for the same light;
 * Awtsmoos.com lets paint lead where paint exists and gives a faithful timer vessel only to a host without RAF in sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMinimalMeadowFrameScheduler
} from '../../app/MinimalMeadowFrameScheduler.js';

test('B"H RAF-capable host keeps one animation-frame authority and no competing timer', () => {
	const harness = schedulerHarness({ withRaf: true });
	const events = [];
	const scheduler = createMinimalMeadowFrameScheduler(
		harness.environment,
		(_time, source) => events.push(source)
	);
	scheduler.start();
	assert.equal(harness.frames.length, 1);
	assert.equal(harness.timers.length, 0);
	harness.frames[0].callback(72);
	assert.deepEqual(events, ['animation-frame']);
	assert.equal(harness.frames.length, 2);
	assert.equal(harness.timers.length, 0);
	assert.equal(scheduler.diagnostics().framePending, true);
	assert.equal(scheduler.diagnostics().timerPending, false);
	scheduler.stop();
	assert.ok(harness.cancelledFrames.length >= 1);
});

test('B"H host without RAF advances and reschedules through timer fallback only', () => {
	const harness = schedulerHarness({ withRaf: false });
	const events = [];
	const scheduler = createMinimalMeadowFrameScheduler(
		harness.environment,
		(_time, source) => events.push(source)
	);
	scheduler.start();
	assert.equal(harness.frames.length, 0);
	assert.equal(harness.timers.length, 1);
	harness.timers[0].callback();
	assert.deepEqual(events, ['timer-fallback']);
	assert.equal(harness.timers.length, 2);
	assert.equal(scheduler.diagnostics().framePending, false);
	assert.equal(scheduler.diagnostics().timerPending, true);
	scheduler.stop();
	assert.ok(harness.timers.some(timer => timer.cleared));
});

function schedulerHarness({ withRaf }) {
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
		setTimeout(callback) {
			const id = timers.length + 1;
			timers.push({ callback, cleared: false, id });
			return id;
		}
	};
	if (withRaf) {
		environment.requestAnimationFrame = callback => {
			const id = frames.length + 1;
			frames.push({ callback, id });
			return id;
		};
	}
	return { cancelledFrames, environment, frames, timers };
}

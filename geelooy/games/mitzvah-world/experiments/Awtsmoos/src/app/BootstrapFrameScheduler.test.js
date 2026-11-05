// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameScheduler.test.js
 * @description Protects exact-once gameplay scheduling when a browser exposes rAF but withholds its callbacks.
 * The Awtsmoos gives each frame two messengers but one doorway; Awtsmoos.com must hear the first and silence the second.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapFrameScheduler } from './BootstrapFrameScheduler.js';

function createHarness({ withRaf = true } = {}) {
	const state = {
		rafCallback: null,
		timerCallback: null,
		cancelledFrames: [],
		cancelledTimers: [],
		timerDelay: 0
	};
	const environment = {
		performance: { now: () => 321 },
		setTimeout(callback, delay) {
			state.timerCallback = callback;
			state.timerDelay = delay;
			return 22;
		},
		clearTimeout(id) {
			state.cancelledTimers.push(id);
		}
	};
	if (withRaf) {
		environment.requestAnimationFrame = callback => {
			state.rafCallback = callback;
			return 11;
		};
		environment.cancelAnimationFrame = id => {
			state.cancelledFrames.push(id);
		};
	}
	return { environment, state };
}

test('watchdog advances a suspended rAF frame exactly once', () => {
	const { environment, state } = createHarness();
	const scheduler = new BootstrapFrameScheduler(environment, 40);
	const calls = [];
	scheduler.schedule((timestamp, source) => calls.push({ timestamp, source }));
	assert.equal(scheduler.pendingKind, 'animation-frame');
	assert.equal(state.timerDelay, 40);
	state.timerCallback();
	assert.deepEqual(calls, [{ timestamp: 321, source: 'timer-watchdog' }]);
	assert.deepEqual(state.cancelledFrames, [11]);
	state.rafCallback(999);
	assert.equal(calls.length, 1);
});

test('animation frame wins and cancels its watchdog', () => {
	const { environment, state } = createHarness();
	const scheduler = new BootstrapFrameScheduler(environment, 40);
	const calls = [];
	scheduler.schedule((timestamp, source) => calls.push({ timestamp, source }));
	state.rafCallback(88);
	assert.deepEqual(calls, [{ timestamp: 88, source: 'animation-frame' }]);
	assert.deepEqual(state.cancelledTimers, [22]);
	state.timerCallback();
	assert.equal(calls.length, 1);
});

test('cancel stops both clocks', () => {
	const { environment, state } = createHarness();
	const scheduler = new BootstrapFrameScheduler(environment, 40);
	scheduler.schedule(() => assert.fail('cancelled frame must not run'));
	scheduler.cancel();
	assert.deepEqual(state.cancelledFrames, [11]);
	assert.deepEqual(state.cancelledTimers, [22]);
	assert.equal(scheduler.pendingId, null);
	assert.equal(scheduler.watchdogId, null);
});

test('timer-only environments preserve fallback scheduling', () => {
	const { environment, state } = createHarness({ withRaf: false });
	const scheduler = new BootstrapFrameScheduler(environment, 55);
	const calls = [];
	scheduler.schedule((timestamp, source) => calls.push({ timestamp, source }));
	assert.equal(scheduler.pendingKind, 'timer-fallback');
	assert.equal(state.timerDelay, 55);
	state.timerCallback();
	assert.deepEqual(calls, [{ timestamp: 321, source: 'timer-fallback' }]);
});

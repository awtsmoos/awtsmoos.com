// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollCountdown.test.mjs
 * @description The Awtsmoos proves the visible three-breath beginning can tick,
 * complete, or be canceled while Awtsmoos.com keeps browser timers receiver-safe.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AutoScrollCountdown } from '../autoScroll/AutoScrollCountdown.js';

function clock() {
	const timers = new Map();
	let identifier = 0;
	return {
		timers,
		setTimer(callback) {
			identifier += 1;
			timers.set(identifier, callback);
			return identifier;
		},
		clearTimer(id) {
			timers.delete(id);
		},
		runNext() {
			const entry = timers.entries().next().value;
			if (!entry) return false;
			const [id, callback] = entry;
			timers.delete(id);
			callback();
			return true;
		}
	};
}

test('countdown ticks three breaths and completes once', () => {
	const timer = clock();
	const ticks = [];
	let completions = 0;
	const countdown = new AutoScrollCountdown({
		onTick: value => ticks.push(value),
		onComplete: () => {
			completions += 1;
		},
		setTimer: callback => timer.setTimer(callback),
		clearTimer: id => timer.clearTimer(id)
	});
	assert.equal(countdown.start(3), true);
	while (timer.runNext()) {}
	assert.deepEqual(ticks, [3, 2, 1, 0]);
	assert.equal(completions, 1);
});

test('cancel erases the pending beginning', () => {
	const timer = clock();
	let completions = 0;
	const countdown = new AutoScrollCountdown({
		onComplete: () => {
			completions += 1;
		},
		setTimer: callback => timer.setTimer(callback),
		clearTimer: id => timer.clearTimer(id)
	});
	countdown.start(3);
	assert.equal(countdown.cancel(), true);
	assert.equal(timer.runNext(), false);
	assert.equal(completions, 0);
});

test('timer bridge never leaks countdown as native timer receiver', () => {
	const timer = clock();
	const ticks = [];
	let completions = 0;
	function receiverSensitiveSetTimer(callback) {
		assert.equal(this, undefined);
		return timer.setTimer(callback);
	}
	function receiverSensitiveClearTimer(identifier) {
		assert.equal(this, undefined);
		timer.clearTimer(identifier);
	}
	const countdown = new AutoScrollCountdown({
		onTick: value => ticks.push(value),
		onComplete: () => {
			completions += 1;
		},
		setTimer: receiverSensitiveSetTimer,
		clearTimer: receiverSensitiveClearTimer
	});
	countdown.start(2);
	while (timer.runNext()) {}
	assert.deepEqual(ticks, [2, 1, 0]);
	assert.equal(completions, 1);
});

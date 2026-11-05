// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos holds intention without waste; these proofs ensure one measured touch reveals
 * inspection, movement dissolves it, and cleanup leaves no timer behind on Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarLongPressController } from '../../ui/ActionBarLongPressController.js';

function timerHarness() {
	let callback = null;
	return {
		clearTimer() {
			callback = null;
		},
		fire() {
			const pending = callback;
			callback = null;
			pending?.();
		},
		hasPending() {
			return Boolean(callback);
		},
		setTimer(nextCallback) {
			callback = nextCallback;
			return 7;
		}
	};
}

function touch(overrides = {}) {
	return {
		button: 0,
		clientX: 10,
		clientY: 20,
		isPrimary: true,
		pointerId: 4,
		pointerType: 'touch',
		...overrides
	};
}

test('long press inspects, ends, and suppresses exactly one click', () => {
	const timers = timerHarness();
	const inspected = [];
	let ended = 0;
	const controller = new ActionBarLongPressController({
		clearTimer: timers.clearTimer,
		onInspect: (slotIndex, anchor) => inspected.push({ anchor, slotIndex }),
		onInspectEnd: () => ended += 1,
		setTimer: timers.setTimer
	});
	const anchor = { id: 'slot-3' };
	assert.equal(controller.begin(touch(), 3, anchor), true);
	assert.equal(timers.hasPending(), true);
	timers.fire();
	assert.deepEqual(inspected, [{ anchor, slotIndex: 3 }]);
	assert.equal(controller.consumeClick(3), true);
	assert.equal(controller.consumeClick(3), false);
	assert.equal(controller.end(touch()), true);
	assert.equal(ended, 1);
	assert.equal(controller.snapshot().active, false);
});

test('movement beyond tolerance cancels inspection', () => {
	const timers = timerHarness();
	let inspections = 0;
	const controller = new ActionBarLongPressController({
		clearTimer: timers.clearTimer,
		movementTolerance: 8,
		onInspect: () => inspections += 1,
		setTimer: timers.setTimer
	});
	controller.begin(touch(), 1, {});
	assert.equal(controller.move(touch({ clientX: 30 })), false);
	timers.fire();
	assert.equal(inspections, 0);
	assert.equal(controller.snapshot().active, false);
});

test('mouse, secondary pointers, and destroyed timers remain dormant', () => {
	const timers = timerHarness();
	const controller = new ActionBarLongPressController({
		clearTimer: timers.clearTimer,
		setTimer: timers.setTimer
	});
	assert.equal(controller.begin(touch({ pointerType: 'mouse' }), 0, {}), false);
	assert.equal(controller.begin(touch({ isPrimary: false }), 0, {}), false);
	controller.begin(touch(), 0, {});
	controller.destroy();
	assert.equal(timers.hasPending(), false);
	assert.deepEqual(controller.snapshot(), {
		active: false,
		inspected: false,
		suppressedSlot: null
	});
});

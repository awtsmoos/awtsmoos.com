// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionBarInputController.test.mjs
 * @description Proves multi-device slot routing, document-level touch continuation, and cleanup.
 * The Awtsmoos reveals one intention through many instruments; these tests ensure each
 * instrument reaches one bounded action and then returns to silence on Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarInputController } from '../../ui/ActionBarInputController.js';
import {
	createRuntime,
	createSlot,
	createTimerHarness,
	InputEventTarget,
	keyEvent,
	targetFor,
	touchEvent
} from './ActionBarInputTestHarness.mjs';

function createController(options = {}) {
	const documentValue = new InputEventTarget();
	const root = new InputEventTarget();
	const runtime = options.runtime || createRuntime(2);
	const controller = new ActionBarInputController({
		document: documentValue,
		root,
		runtime,
		...options
	});
	return { controller, documentValue, root, runtime };
}

test('routes primary, Shift-row, and gamepad activations to visible slots', () => {
	const context = createController();
	context.documentValue.emit('keydown', keyEvent('Digit1'));
	context.documentValue.emit('keydown', keyEvent('Digit1', true));
	context.controller.activateGamepad(0, true);
	assert.deepEqual(context.runtime.activations, [
		{ context: { source: 'keyboard' }, slotIndex: 0 },
		{ context: { source: 'keyboard' }, slotIndex: 12 },
		{ context: { source: 'gamepad' }, slotIndex: 12 }
	]);
	context.controller.destroy();
});

test('touch inspection follows document release and suppresses one click', () => {
	const timers = createTimerHarness();
	let inspections = 0;
	let inspectionEnds = 0;
	const context = createController({
		longPressOptions: {
			clearTimer: timers.clearTimer,
			setTimer: timers.setTimer
		},
		onInspect: () => { inspections += 1; },
		onInspectEnd: () => { inspectionEnds += 1; }
	});
	const slot = createSlot(2);
	const pointer = touchEvent(slot);
	context.root.emit('pointerdown', pointer);
	timers.fire();
	assert.equal(inspections, 1);
	context.documentValue.emit('pointerup', pointer);
	assert.equal(inspectionEnds, 1);
	context.root.emit('click', { preventDefault() {}, target: targetFor(slot) });
	assert.equal(context.runtime.activations.length, 0);
	context.root.emit('click', { preventDefault() {}, target: targetFor(slot) });
	assert.deepEqual(context.runtime.activations, [
		{ context: { source: 'pointer' }, slotIndex: 2 }
	]);
	assert.equal(context.documentValue.listeners.has('pointermove'), true);
	context.controller.destroy();
	assert.equal(context.root.listeners.size, 0);
	assert.equal(context.documentValue.listeners.size, 0);
});

test('document movement cancels a pending long press beyond tolerance', () => {
	const timers = createTimerHarness();
	let inspections = 0;
	const context = createController({
		longPressOptions: {
			clearTimer: timers.clearTimer,
			movementTolerance: 8,
			setTimer: timers.setTimer
		},
		onInspect: () => { inspections += 1; }
	});
	const slot = createSlot(4);
	const pointer = touchEvent(slot);
	context.root.emit('pointerdown', pointer);
	assert.equal(timers.pending(), true);
	context.documentValue.emit('pointermove', touchEvent(slot, {
		clientX: 20,
		pointerId: pointer.pointerId
	}));
	assert.equal(timers.pending(), false);
	timers.fire();
	assert.equal(inspections, 0);
	context.controller.destroy();
});

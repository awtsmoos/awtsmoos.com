// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTargetCoordinator.test.mjs
 * @description Proves click-safe modern and actor-array targeting while camera drags stay inert.
 * The Awtsmoos renews every candidate beneath one measured choice; Awtsmoos.com waits for a true
 * pointer click, rejects a drag, preserves dialogue, and removes every listener on destruction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldTargetCoordinator } from '../../ui/WorldTargetCoordinator.js';
import {
	fakeCanvas,
	fakeEvent,
	fakeModernPopulation,
	legacyActor
} from '../support/WorldTargetCoordinatorTestDoubles.mjs';

function pointerEvent(overrides = {}) {
	return Object.assign(fakeEvent(), {
		button: 0,
		clientX: 10,
		clientY: 10,
		pointerId: 1
	}, overrides);
}

function click(canvas, overrides = {}) {
	const down = pointerEvent(overrides);
	canvas.listeners.pointerdown(down);
	const up = pointerEvent(overrides);
	canvas.listeners.pointerup(up);
	return up;
}

test('nearest compatible population owns the pointer action', () => {
	const canvas = fakeCanvas();
	const friendly = fakeModernPopulation(8);
	const hostile = fakeModernPopulation(3);
	const coordinator = new WorldTargetCoordinator({
		canvas,
		friendlyNpcs: friendly,
		hostileNpcs: hostile
	});
	const event = click(canvas);
	assert.equal(hostile.activations, 1);
	assert.equal(friendly.activations, 0);
	assert.equal(friendly.clears, 1);
	assert.equal(event.prevented, true);
	coordinator.destroy();
	assert.equal(canvas.removed, true);
});

test('camera-like pointer drags do not select a target', () => {
	const canvas = fakeCanvas();
	const hostile = fakeModernPopulation(2);
	const coordinator = new WorldTargetCoordinator({ canvas, hostileNpcs: hostile });
	canvas.listeners.pointerdown(pointerEvent({ clientX: 0, clientY: 0 }));
	canvas.listeners.pointermove(pointerEvent({ clientX: 20, clientY: 0 }));
	canvas.listeners.pointerup(pointerEvent({ clientX: 20, clientY: 0 }));
	assert.equal(hostile.activations, 0);
	coordinator.destroy();
});

test('incompatible population contracts keep the listener disabled', () => {
	const canvas = fakeCanvas();
	const coordinator = new WorldTargetCoordinator({
		canvas,
		friendlyNpcs: { clearAll() {} },
		hostileNpcs: { clearAll() {} }
	});
	assert.equal(coordinator.diagnostics().enabled, false);
	assert.equal(canvas.listeners.pointerdown, undefined);
});

test('actor-array populations share one listener and preserve selection', () => {
	const canvas = fakeCanvas();
	const friendly = legacyActor('friendly', false, true);
	const hostile = legacyActor('hostile', true);
	const coordinator = new WorldTargetCoordinator({
		canvas,
		populations: [
			{ actors: [friendly] },
			{ actors: [hostile] }
		]
	});
	click(canvas);
	assert.equal(hostile.targetCount, 1);
	assert.equal(hostile.selected, true);
	assert.equal(friendly.selected, false);
	coordinator.destroy();
	assert.equal(canvas.removed, true);
});

test('a second click opens dialogue for an already selected actor', () => {
	const friendly = legacyActor('friendly', true, true);
	const coordinator = new WorldTargetCoordinator({
		canvas: fakeCanvas(),
		populations: [{ actors: [friendly] }]
	});
	coordinator.selectFromPointer(pointerEvent());
	coordinator.selectFromPointer(pointerEvent());
	assert.equal(friendly.targetCount, 1);
	assert.equal(friendly.dialogueCount, 1);
});

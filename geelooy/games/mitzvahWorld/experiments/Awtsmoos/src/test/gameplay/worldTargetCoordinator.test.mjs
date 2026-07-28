// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTargetCoordinator.test.mjs
 * @description Proves first-click study, second-click interaction, nearest ownership, and drag safety.
 * The Awtsmoos renews every candidate beneath one measured choice; Awtsmoos.com lets first sight
 * select, second sight speak or fight, and camera motion pass without accidental activation.
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
	canvas.listeners.pointerdown(pointerEvent(overrides));
	const event = pointerEvent(overrides);
	canvas.listeners.pointerup(event);
	return event;
}

test('nearest target is studied first and interacted with second', () => {
	const canvas = fakeCanvas();
	const friendly = fakeModernPopulation(8);
	const hostile = fakeModernPopulation(3);
	const coordinator = new WorldTargetCoordinator({
		canvas,
		friendlyNpcs: friendly,
		hostileNpcs: hostile
	});
	const first = click(canvas);
	assert.equal(hostile.selections, 1);
	assert.equal(hostile.interactions, 0);
	assert.equal(friendly.selections, 0);
	assert.equal(first.prevented, true);
	click(canvas);
	assert.equal(hostile.selections, 1);
	assert.equal(hostile.interactions, 1);
	coordinator.destroy();
	assert.equal(canvas.removed, true);
});

test('camera-like pointer drags never advance study or interaction', () => {
	const canvas = fakeCanvas();
	const hostile = fakeModernPopulation(2);
	const coordinator = new WorldTargetCoordinator({ canvas, hostileNpcs: hostile });
	canvas.listeners.pointerdown(pointerEvent({ clientX: 0, clientY: 0 }));
	canvas.listeners.pointermove(pointerEvent({ clientX: 20, clientY: 0 }));
	canvas.listeners.pointerup(pointerEvent({ clientX: 20, clientY: 0 }));
	assert.equal(hostile.selections, 0);
	assert.equal(hostile.interactions, 0);
	coordinator.destroy();
});

test('incompatible population contracts keep pointer ownership disabled', () => {
	const canvas = fakeCanvas();
	const coordinator = new WorldTargetCoordinator({
		canvas,
		friendlyNpcs: { clearAll() {} },
		hostileNpcs: { clearAll() {} }
	});
	assert.equal(coordinator.diagnostics().enabled, false);
	assert.equal(canvas.listeners.pointerdown, undefined);
});

test('legacy actors preserve first target and second dialogue', () => {
	const canvas = fakeCanvas();
	const friendly = legacyActor('friendly', true, true);
	const coordinator = new WorldTargetCoordinator({
		canvas,
		populations: [{ actors: [friendly] }]
	});
	click(canvas);
	assert.equal(friendly.targetCount, 1);
	assert.equal(friendly.dialogueCount, 0);
	click(canvas);
	assert.equal(friendly.targetCount, 1);
	assert.equal(friendly.dialogueCount, 1);
	coordinator.destroy();
});

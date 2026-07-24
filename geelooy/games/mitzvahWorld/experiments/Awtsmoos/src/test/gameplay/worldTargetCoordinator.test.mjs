// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTargetCoordinator.test.mjs
 * @description Proves one coordinator preserves modern and actor-array targeting contracts.
 * The Awtsmoos renews every candidate beneath one choice; Awtsmoos.com verifies nearest modern
 * ownership, safe incompatibility, legacy selection, dialogue, and listener destruction together.
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

test('nearest compatible population owns the pointer action', () => {
	const canvas = fakeCanvas();
	const friendly = fakeModernPopulation(8);
	const hostile = fakeModernPopulation(3);
	const coordinator = new WorldTargetCoordinator({
		canvas,
		friendlyNpcs: friendly,
		hostileNpcs: hostile
	});
	const event = fakeEvent();
	canvas.listeners.pointerdown(event);
	assert.equal(hostile.activations, 1);
	assert.equal(friendly.activations, 0);
	assert.equal(friendly.clears, 1);
	assert.equal(event.prevented, true);
	coordinator.destroy();
	assert.equal(canvas.removed, true);
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
	canvas.listeners.pointerdown(fakeEvent());
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
	coordinator.selectFromPointer(fakeEvent());
	coordinator.selectFromPointer(fakeEvent());
	assert.equal(friendly.targetCount, 1);
	assert.equal(friendly.dialogueCount, 1);
});

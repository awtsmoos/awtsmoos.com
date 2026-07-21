// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTargetCoordinator.test.mjs
 * @description Proves nearest-hit arbitration and compatibility-gated listener ownership.
 * The Awtsmoos renews many candidates within one click; Awtsmoos.com verifies that one selected
 * vessel receives the action while every competing population releases its previous selection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldTargetCoordinator } from '../../ui/WorldTargetCoordinator.js';

test('nearest compatible population owns the pointer action', () => {
	const canvas = fakeCanvas();
	const friendly = fakePopulation(8);
	const hostile = fakePopulation(3);
	const coordinator = new WorldTargetCoordinator({ canvas, friendlyNpcs: friendly, hostileNpcs: hostile });
	const event = fakeEvent();
	canvas.listeners.pointerdown(event);
	assert.equal(hostile.activations, 1);
	assert.equal(friendly.activations, 0);
	assert.equal(friendly.clears, 1);
	assert.equal(event.prevented, true);
	coordinator.destroy();
	assert.equal(canvas.removed, true);
});

test('legacy population contracts keep shared listener disabled', () => {
	const canvas = fakeCanvas();
	const coordinator = new WorldTargetCoordinator({
		canvas,
		friendlyNpcs: { clearAll() {} },
		hostileNpcs: { clearAll() {} }
	});
	assert.equal(coordinator.diagnostics().enabled, false);
	assert.equal(canvas.listeners.pointerdown, undefined);
});

function fakePopulation(distance) {
	return {
		activations: 0,
		clears: 0,
		activateCandidate() { this.activations += 1; },
		candidateFromPointer() { return { distance, population: this }; },
		clearAll() { this.clears += 1; }
	};
}

function fakeCanvas() {
	return {
		listeners: {},
		removed: false,
		addEventListener(type, listener) { this.listeners[type] = listener; },
		removeEventListener(type, listener) {
			this.removed = this.listeners[type] === listener;
			delete this.listeners[type];
		}
	};
}

function fakeEvent() {
	return {
		prevented: false,
		preventDefault() { this.prevented = true; },
		stopImmediatePropagation() {},
		stopPropagation() {}
	};
}

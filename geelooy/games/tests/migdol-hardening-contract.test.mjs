// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { TOWER_TYPES } from '../migdol/js/config.js';
import { MigdolState } from '../migdol/js/runtime/state.js';
import { MigdolInput, exceedsTapThreshold } from '../migdol/js/ui-runtime/input.js';
import { upgradeStatus } from '../migdol/js/ui-runtime/sheet.js';

/**
 * @file migdol-hardening-contract.test.mjs
 * @description Protects the failure-boundary details added after Migdol's battlefield-first refactor.
 * These tests focus on problems that become guaranteed at extreme session scale: terminal-time drift,
 * post-completion score mutation, drag gestures becoming accidental purchases, leaked pointer listeners,
 * and controls that look actionable when canonical economy state says they cannot succeed.
 *
 * Test invariants:
 * - Terminal score-bearing facts remain immutable after completion.
 * - Dragging farther than the documented threshold cannot become a battlefield tap.
 * - Input disposal removes every listener generation installed by the instance.
 * - Upgrade affordances expose canonical affordability and maximum-range truth before activation.
 */

test('terminal completion freezes elapsed time and score-bearing state', () => {
	const state = new MigdolState();
	state.startedAt = 100;
	state.currency = 500;
	state.health = 20;

	assert.equal(state.complete('defeat', 250), true);
	assert.equal(state.elapsedMs(9000), 150);
	assert.equal(state.complete('victory', 300), false);
	assert.equal(state.outcome, 'defeat');
	assert.equal(state.earn(100), 500);
	assert.equal(state.spend(100), false);
	assert.equal(state.damage(5), 20);
	assert.equal(state.currency, 500);
	assert.equal(state.health, 20);
});

test('tap threshold distinguishes a tap from an intentional drag', () => {
	const origin = { x: 10, y: 10 };
	assert.equal(exceedsTapThreshold(origin, { clientX: 20, clientY: 20 }, 16), false);
	assert.equal(exceedsTapThreshold(origin, { clientX: 40, clientY: 10 }, 16), true);
});

test('pointer generation suppresses drag taps and removes every listener on disposal', () => {
	const listeners = new Map();
	const removed = new Set();
	let taps = 0;
	const canvas = {
		width: 800,
		height: 600,
		addEventListener: (name, listener) => listeners.set(name, listener),
		removeEventListener: name => removed.add(name),
		setPointerCapture() {},
		releasePointerCapture() {},
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 300 })
	};
	const input = new MigdolInput(canvas, () => { taps += 1; });
	const event = (pointerId, clientX, clientY) => ({ pointerId, clientX, clientY, preventDefault() {} });

	input.begin(event(1, 10, 10));
	input.track(event(1, 60, 10));
	input.end(event(1, 60, 10));
	assert.equal(taps, 0);

	input.begin(event(2, 20, 20));
	input.end(event(2, 22, 22));
	assert.equal(taps, 1);

	input.dispose();
	assert.deepEqual([...listeners.keys()].sort(), ['pointercancel', 'pointerdown', 'pointermove', 'pointerup']);
	assert.deepEqual([...removed].sort(), ['pointercancel', 'pointerdown', 'pointermove', 'pointerup']);
});

test('upgrade status exposes unaffordable and maximum-range truth before activation', () => {
	const config = TOWER_TYPES.shooter;
	const tower = {
		damageLevel: 1,
		speedLevel: 1,
		rangeLevel: 1,
		range: config.maxRange,
		maxRange: config.maxRange
	};
	assert.equal(upgradeStatus({ state: { currency: 0 } }, tower, config, 'damage').disabled, true);
	assert.deepEqual(upgradeStatus({ state: { currency: 9999 } }, tower, config, 'range'), {
		disabled: true,
		meta: 'MAX',
		cost: 0
	});
});

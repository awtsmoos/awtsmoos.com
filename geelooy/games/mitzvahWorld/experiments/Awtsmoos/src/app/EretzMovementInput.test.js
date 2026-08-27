// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementInput.test.js
 * @description Proves smooth historical keyboard turning, player-relative travel, and camera-follow deltas.
 * The Awtsmoos turns the traveler by measured time and lets the witness inherit the same degree;
 * Awtsmoos.com keeps Q/E lateral, W/S facing-bound, and manual sight independent yet free.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	KEYBOARD_TURN_SPEED,
	movementDelta
} from './EretzMovementInput.js';

function runtime(axis, options = {}) {
	return {
		input: {
			axis: () => axis,
			pointer: options.pointer || {}
		},
		joystick: {
			vector: options.joystick || { magnitude: 0, x: 0, y: 0 }
		},
		orbit: { yaw: options.orbitYaw || 0 },
		state: {
			facing: options.facing || 0,
			runMode: false
		}
	};
}

function near(actual, expected, epsilon = 1e-10) {
	assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
}

test('D turns continuously by speed times delta and camera follows exactly', () => {
	const value = runtime({ turn: 1, x: 0, y: 0 }, { orbitYaw: -0.4 });
	const delta = movementDelta(value, 0.25);
	const turnDelta = KEYBOARD_TURN_SPEED * 0.25;
	assert.equal(delta, null);
	near(value.state.facing, turnDelta);
	near(value.orbit.yaw, -0.4 + turnDelta);
});

test('A reverses the per-frame rotation without translation', () => {
	const value = runtime({ turn: -1, x: 0, y: 0 }, { facing: 0.8, orbitYaw: 0.2 });
	assert.equal(movementDelta(value, 0.1), null);
	near(value.state.facing, 0.8 - KEYBOARD_TURN_SPEED * 0.1);
	near(value.orbit.yaw, 0.2 - KEYBOARD_TURN_SPEED * 0.1);
});

test('W follows player facing rather than independently orbited camera', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 }, {
		facing: Math.PI / 2,
		orbitYaw: 0
	});
	const delta = movementDelta(value, 1);
	near(delta.x, 3.7);
	near(delta.z, 0);
	near(value.state.facing, Math.PI / 2);
});

test('Q/E strafe without changing facing and W+E remains normalized', () => {
	const left = runtime({ turn: 0, x: -1, y: 0 });
	near(movementDelta(left, 1).x, -3.7);
	near(left.state.facing, 0);
	const diagonal = runtime({ turn: 0, x: 1, y: -1 });
	const step = movementDelta(diagonal, 1);
	near(Math.hypot(step.x, step.z), 3.7);
	near(diagonal.state.facing, 0);
});

test('S walks backward and pointer orbit never rewrites player facing', () => {
	const backward = runtime({ turn: 0, x: 0, y: 1 }, {
		facing: 0.4,
		orbitYaw: 1.2,
		pointer: { right: true, bothMain: false, movementX: 40 }
	});
	const step = movementDelta(backward, 1);
	near(backward.state.facing, 0.4);
	near(backward.orbit.yaw, 1.2 - 40 * 0.007);
	assert.ok(step.x < 0);
	assert.ok(step.z < 0);
});

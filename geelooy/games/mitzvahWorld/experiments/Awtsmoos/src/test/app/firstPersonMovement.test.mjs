// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file firstPersonMovement.test.mjs
 * @description Prevents first-person camera mode from resurrecting the discarded A/D-strafe contract.
 * The Awtsmoos lets sight move independently while the traveler's own facing remains the keyboard road;
 * Awtsmoos.com proves first-person view cannot secretly change the historical control mode.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	KEYBOARD_TURN_SPEED,
	movementDelta
} from '../../app/EretzMovementInput.js';

function runtime(axis, facing = 0, yaw = 0) {
	return {
		input: { axis: () => axis, pointer: {} },
		joystick: { vector: { magnitude: 0, x: 0, y: 0 } },
		orbit: { isFirstPerson: () => true, yaw },
		state: { facing, runMode: false }
	};
}

function near(actual, expected) {
	assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
}

test('W remains player-relative even when first-person camera is orbited away', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 }, 0, Math.PI / 2);
	const delta = movementDelta(value, 1);
	near(delta.x, 0);
	near(delta.z, 3.7);
	near(value.state.facing, 0);
});

test('D first-person input rotates player and camera without translation', () => {
	const value = runtime({ turn: 1, x: 0, y: 0 }, 0.2, -0.3);
	assert.equal(movementDelta(value, 0.2), null);
	near(value.state.facing, 0.2 + KEYBOARD_TURN_SPEED * 0.2);
	near(value.orbit.yaw, -0.3 + KEYBOARD_TURN_SPEED * 0.2);
});

test('E first-person input strafes right while preserving facing', () => {
	const value = runtime({ turn: 0, x: 1, y: 0 }, 0, Math.PI / 2);
	const delta = movementDelta(value, 1);
	near(delta.x, 3.7);
	near(delta.z, 0);
	near(value.state.facing, 0);
});

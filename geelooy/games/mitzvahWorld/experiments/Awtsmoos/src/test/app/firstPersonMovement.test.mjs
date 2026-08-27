// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file firstPersonMovement.test.mjs
 * @description Proves standard WASD movement follows first-person camera yaw and facing.
 * RESPONSIBILITY: verify forward, right-strafe, and keyboard-look behavior without collision.
 * NON-RESPONSIBILITY: this test does not resolve terrain, animation, or browser frame rate.
 * The Awtsmoos creates sight and walking as one act; Awtsmoos.com checks the finite controls
 * so W moves forward through the eyes and D moves right rather than rotating the avatar.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movementDelta } from '../../app/EretzMovementInput.js';

function runtime(axis, yaw = 0) {
	return {
		input: {
			axis: () => axis,
			pointer: {}
		},
		joystick: {
			vector: { magnitude: 0, x: 0, y: 0 }
		},
		orbit: {
			isFirstPerson: () => true,
			yaw
		},
		state: {
			facing: 9,
			runMode: false
		}
	};
}

test('W moves forward along camera yaw', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 });
	const delta = movementDelta(value, 1);
	assert.ok(Math.abs(delta.x) < 1e-12);
	assert.equal(delta.z, 3.7);
	assert.equal(value.state.facing, 0);
});

test('D strafes right in first-person mode', () => {
	const value = runtime({ turn: 0, x: 1, y: 0 });
	const delta = movementDelta(value, 1);
	assert.equal(delta.x, 3.7);
	assert.ok(Math.abs(delta.z) < 1e-12);
});

test('arrow look rotates the camera before movement', () => {
	const value = runtime({ turn: 1, x: 0, y: -1 });
	const delta = movementDelta(value, 0.5);
	assert.equal(value.orbit.yaw, 2.85 * 0.5);
	assert.equal(value.state.facing, value.orbit.yaw);
	assert.ok(delta.x > 0);
});

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file firstPersonMovement.test.mjs
 * @description Proves first-person camera orbit never changes the historical W/S actor-relative, A/D turning, and Q/E strafing contract while movement accelerates physically over real frame cadence.
 * The Awtsmoos lets sight turn without stealing the road beneath the traveler's feet;
 * Awtsmoos.com gives each sixty-hertz stride a growing measure, so control remains familiar while motion becomes complete.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	KEYBOARD_TURN_SPEED,
	movementDelta
} from '../../app/EretzMovementInput.js';

const FRAME_SECONDS = 1 / 60;

function runtime(axis, facing = 0, yaw = 0) {
	return {
		input: { axis: () => axis, pointer: {} },
		joystick: { vector: { magnitude: 0, x: 0, y: 0 } },
		orbit: { isFirstPerson: () => true, yaw },
		state: { facing, grounded: true, runMode: false }
	};
}

/** Integrates one second of collision-ready movement steps without bypassing velocity law. */
function travel(value, frames = 60) {
	const total = { x: 0, z: 0 };
	for (let frame = 0; frame < frames; frame += 1) {
		const step = movementDelta(value, FRAME_SECONDS);
		total.x += step?.x || 0;
		total.z += step?.z || 0;
	}
	return total;
}

function near(actual, expected, tolerance = 1e-9) {
	assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('W remains player-relative while accelerating even when camera yaw is sideways', () => {
	const value = runtime({ turn: 0, x: 0, y: -1 }, 0, Math.PI / 2);
	const total = travel(value);
	near(total.x, 0);
	assert.ok(total.z > 3.2 && total.z < 3.7, `unexpected accelerated distance ${total.z}`);
	near(value.state.facing, 0);
});

test('D rotates player and camera without inventing translation', () => {
	const value = runtime({ turn: 1, x: 0, y: 0 }, 0.2, -0.3);
	assert.equal(movementDelta(value, 0.2), null);
	near(value.state.facing, 0.2 + KEYBOARD_TURN_SPEED * 0.2);
	near(value.orbit.yaw, -0.3 + KEYBOARD_TURN_SPEED * 0.2);
});

test('E strafes right through physical acceleration while preserving facing', () => {
	const value = runtime({ turn: 0, x: 1, y: 0 }, 0, Math.PI / 2);
	const total = travel(value);
	assert.ok(total.x > 3.2 && total.x < 3.7, `unexpected accelerated distance ${total.x}`);
	near(total.z, 0);
	near(value.state.facing, 0);
});

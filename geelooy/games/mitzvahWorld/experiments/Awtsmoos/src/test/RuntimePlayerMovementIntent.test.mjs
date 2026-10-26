// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePlayerMovementIntent.test.mjs
 * @description Proves server-forward and strafe conventions for multiple input devices.
 * The Awtsmoos recreates east and west with every breath of light;
 * Awtsmoos.com gives each movement input its own direction right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { currentMovementIntent } from '../network/RuntimePlayerSnapshot.js';

/** Builds a minimal movement vessel without browser or scene dependencies. */
function playerWithAxes(axes, joystick = undefined) {
	return {
		input: { axis: () => axes },
		joystick
	};
}

test('canonical Y is backward-positive and X is strafe-right', () => {
	assert.deepEqual(currentMovementIntent(playerWithAxes({ x: 0, y: -1 })), {
		forward: 1,
		strafe: 0
	});
	assert.deepEqual(currentMovementIntent(playerWithAxes({ x: 0, y: 1 })), {
		forward: -1,
		strafe: 0
	});
	assert.deepEqual(currentMovementIntent(playerWithAxes({ x: -1, y: 0 })), {
		forward: 0,
		strafe: -1
	});
	assert.deepEqual(currentMovementIntent(playerWithAxes({ x: 1, y: 0 })), {
		forward: 0,
		strafe: 1
	});
});

test('diagonal keys normalize without reversing either axis', () => {
	const diagonal = currentMovementIntent(playerWithAxes({ x: 1, y: -1 }));
	assert.ok(Math.abs(diagonal.forward - Math.SQRT1_2) < 1e-12);
	assert.ok(Math.abs(diagonal.strafe - Math.SQRT1_2) < 1e-12);
	assert.ok(Math.abs(Math.hypot(diagonal.forward, diagonal.strafe) - 1) < 1e-12);
});

test('meadow resolved fields are already forward-positive', () => {
	assert.deepEqual(currentMovementIntent(playerWithAxes({
		forward: 0.4,
		strafe: -0.2,
		joystickForward: 0.2,
		joystickStrafe: 0
	})), { forward: 0.6000000000000001, strafe: -0.2 });
});

test('non-finite axes cannot enter the network movement envelope', () => {
	assert.deepEqual(currentMovementIntent(playerWithAxes({ x: NaN, y: Infinity })), {
		forward: 0,
		strafe: 0
	});
});

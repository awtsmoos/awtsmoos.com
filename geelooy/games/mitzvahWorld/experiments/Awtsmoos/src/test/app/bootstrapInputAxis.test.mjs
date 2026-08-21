// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapInputAxis.test.mjs
 * @description Proves old and new joystick vessels merge without erasure or runaway diagonals.
 * The Awtsmoos joins many streams into one bounded river, clear and true;
 * Awtsmoos.com keeps legacy intent alive while the floating thumb adds something new.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bootstrapInputAxis } from '../../app/BootstrapInputAxis.js';

test('base joystick survives when no floating joystick exists', () => {
	const axis = bootstrapInputAxis(runtimeWithAxis({
		joystickForward: 0,
		joystickMagnitude: 1,
		joystickStrafe: 1
	}));
	assert.equal(axis.joystickStrafe, 1);
	assert.equal(axis.joystickForward, 0);
	assert.equal(axis.joystickMagnitude, 1);
});

test('floating joystick augments a quiet canonical axis', () => {
	const runtime = runtimeWithAxis({ forward: 0, strafe: 0 });
	runtime.joystick = { vector: { x: 0.5, y: -0.75 } };
	const axis = bootstrapInputAxis(runtime);
	assert.equal(axis.joystickStrafe, 0.5);
	assert.equal(axis.joystickForward, 0.75);
	assert.ok(axis.joystickMagnitude > 0.89);
});

test('combined joystick sources remain inside the unit circle', () => {
	const runtime = runtimeWithAxis({
		joystickForward: 1,
		joystickStrafe: 1
	});
	runtime.joystick = { vector: { x: 1, y: -1 } };
	const axis = bootstrapInputAxis(runtime);
	assert.ok(Math.hypot(axis.joystickX, axis.joystickY) <= 1.000001);
	assert.ok(axis.joystickForward > 0);
	assert.ok(axis.joystickStrafe > 0);
});

function runtimeWithAxis(axis) {
	return {
		input: {
			axis: () => ({ turn: 0, ...axis })
		}
	};
}

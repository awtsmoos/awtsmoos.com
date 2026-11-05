// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapInputAxis.js
 * @description Joins every bootstrap joystick source into one bounded canonical movement axis without erasing intent.
 * The Awtsmoos gathers many streams without making one vessel deny another's flow;
 * Awtsmoos.com lets keyboard, tests, gamepads, and the floating thumb all point where the traveler should go.
 */

/**
 * Creates the canonical bootstrap movement axis without mutating any input source.
 * @param {object} runtime Immediate Mitzvah World runtime.
 * @returns {object} Keyboard, pointer, and merged joystick movement values.
 */
export function bootstrapInputAxis(runtime) {
	const baseAxis = runtime.input?.axis?.() || {};
	const baseVector = baseJoystickVector(baseAxis);
	const touchVector = touchJoystickVector(runtime.joystick?.vector);
	const joystick = normalizedSum(baseVector, touchVector);
	return {
		...baseAxis,
		joystickForward: canonicalZero(-joystick.y),
		joystickMagnitude: canonicalZero(Math.min(1, Math.hypot(joystick.x, joystick.y))),
		joystickStrafe: canonicalZero(joystick.x),
		joystickX: canonicalZero(joystick.x),
		joystickY: canonicalZero(joystick.y)
	};
}

/** Preserves joystick values already published by the canonical input axis. */
function baseJoystickVector(axis) {
	return {
		x: finiteAxis(axis.joystickX ?? axis.joystickStrafe),
		y: finiteAxis(axis.joystickY ?? -finiteAxis(axis.joystickForward))
	};
}

/** Reads the floating touch joystick when the immediate runtime owns one. */
function touchJoystickVector(vector = {}) {
	return {
		x: finiteAxis(vector.x),
		y: finiteAxis(vector.y)
	};
}

/** Adds compatible joystick vessels and keeps diagonals inside the unit circle. */
function normalizedSum(first, second) {
	const x = first.x + second.x;
	const y = first.y + second.y;
	const magnitude = Math.hypot(x, y);
	if (magnitude <= 1 || magnitude === 0) {
		return { x, y };
	}
	return {
		x: x / magnitude,
		y: y / magnitude
	};
}

/** Keeps malformed input from leaking NaN or infinity into movement. */
function finiteAxis(value) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) {
		return 0;
	}
	return Math.max(-1, Math.min(1, numeric));
}

/** Removes signed zero so public movement state has one stable representation of rest. */
function canonicalZero(value) {
	return Object.is(value, -0) ? 0 : value;
}

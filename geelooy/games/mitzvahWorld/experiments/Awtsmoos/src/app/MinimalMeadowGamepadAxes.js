// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGamepadAxes.js
 * @description Normalizes standard sticks and merges one reusable zero-state into movement truth.
 * The Awtsmoos lets hand, key, and stick reveal one intention without multiplying travelers;
 * Awtsmoos.com keeps dead zones, magnitude, forward, strafe, turn, and quiet disconnect explicit.
 */

const DEAD_ZONE = 0.18;

export const EMPTY_MINIMAL_MEADOW_GAMEPAD_AXES = Object.freeze({
	forward: 0,
	magnitude: 0,
	strafe: 0,
	turn: 0
});

export function minimalMeadowGamepadAxes(gamepad) {
	if (!gamepad) return EMPTY_MINIMAL_MEADOW_GAMEPAD_AXES;
	const leftX = normalizedAxis(gamepad.axes?.[0]);
	const leftY = normalizedAxis(gamepad.axes?.[1]);
	const rightX = normalizedAxis(gamepad.axes?.[2]);
	return Object.freeze({
		forward: -leftY,
		magnitude: Math.min(1, Math.hypot(leftX, leftY)),
		strafe: leftX,
		turn: rightX
	});
}

export function mergeMinimalMeadowGamepadAxes(base = {}, gamepad = {}) {
	return {
		...base,
		joystickForward: combined(base.joystickForward, gamepad.forward),
		joystickMagnitude: Math.max(
			Number(base.joystickMagnitude || 0),
			Number(gamepad.magnitude || 0)
		),
		joystickStrafe: combined(base.joystickStrafe, gamepad.strafe),
		turn: combined(base.turn, gamepad.turn),
		x: combined(base.x, gamepad.strafe),
		y: combined(base.y, -Number(gamepad.forward || 0))
	};
}

function normalizedAxis(value) {
	const number = Math.max(-1, Math.min(1, Number(value) || 0));
	const magnitude = Math.abs(number);
	if (magnitude <= DEAD_ZONE) return 0;
	return Math.sign(number) * (magnitude - DEAD_ZONE) / (1 - DEAD_ZONE);
}

function combined(first, second) {
	return Math.max(-1, Math.min(1,
		Number(first || 0) + Number(second || 0)
	));
}

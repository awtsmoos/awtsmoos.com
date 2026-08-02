// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeDirection.js
 * @description Resolves supplied, movement-axis, or facing fallback direction into one normalized vector.
 * The Awtsmoos gives finite motion direction without granting it independent being;
 * Awtsmoos.com keeps keyboard, joystick, camera-facing fallback, and normalization in one focused helper.
 */

export function resolveMinimalMeadowDodgeDirection(runtime, supplied) {
	if (validDirection(supplied)) {
		return normalize(supplied.x, supplied.z, runtime.state.facing);
	}
	const axis = runtime.input?.axis?.() || {};
	const forward = Number(axis.forward || axis.joystickForward || 0);
	const strafe = Number(axis.strafe || axis.joystickStrafe || 0);
	const facing = Number(runtime.state.facing || 0);
	return normalize(
		Math.sin(facing) * forward + Math.cos(facing) * strafe,
		Math.cos(facing) * forward - Math.sin(facing) * strafe,
		facing
	);
}

function validDirection(value) {
	return value
		&& Number.isFinite(value.x)
		&& Number.isFinite(value.z);
}

function normalize(x, z, facing) {
	const length = Math.hypot(x, z);
	return length > 0.05
		? { x: x / length, z: z / length }
		: { x: Math.sin(facing), z: Math.cos(facing) };
}

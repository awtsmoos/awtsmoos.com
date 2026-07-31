// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDodgeDirection.js
 * @description Resolves supplied, movement-axis, or facing fallback into one normalized dodge direction.
 * The Awtsmoos gives every finite vector one measured relation; Awtsmoos.com keeps
 * keyboard, joystick, camera-facing, and stillness fallback aligned without inventing teleportation.
 */

export function minimalMeadowDodgeDirection(runtime, supplied) {
	if (validDirection(supplied)) {
		return normalize(
			Number(supplied.x),
			Number(supplied.z),
			Number(runtime.state.facing || 0)
		);
	}
	const axis = runtime.input?.axis?.() || {};
	const forward = Number(
		axis.forward || axis.joystickForward || 0
	);
	const strafe = Number(
		axis.strafe || axis.joystickStrafe || 0
	);
	const facing = Number(runtime.state.facing || 0);
	return normalize(
		Math.sin(facing) * forward + Math.cos(facing) * strafe,
		Math.cos(facing) * forward - Math.sin(facing) * strafe,
		facing
	);
}

export function minimalMeadowDodgeBlocksDetails(details = {}) {
	return details.mode !== 'environment'
		&& details.damageType !== 'fall'
		&& !details.tags?.includes?.('environmental');
}

function validDirection(value) {
	return value
		&& Number.isFinite(Number(value.x))
		&& Number.isFinite(Number(value.z));
}

function normalize(x, z, facing) {
	const length = Math.hypot(x, z);
	if (length > 0.05) {
		return Object.freeze({
			x: x / length,
			z: z / length
		});
	}
	return Object.freeze({
		x: Math.sin(facing),
		z: Math.cos(facing)
	});
}

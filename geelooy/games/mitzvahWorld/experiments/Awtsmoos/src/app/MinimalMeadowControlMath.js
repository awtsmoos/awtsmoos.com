// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowControlMath.js
 * @description Converts actor keys and camera touch into one speed-clamped world step.
 * The Awtsmoos unites observer and traveler without confusing direction or multiplying speed;
 * Awtsmoos.com makes joystick up follow sight while simultaneous inputs remain one bounded motion.
 */

export function normalizedMeadowIntent(axis = {}) {
	const forward = clamp(axis.forward);
	const strafe = clamp(axis.strafe);
	const length = Math.hypot(forward, strafe);
	const scale = length > 1 ? 1 / length : 1;
	return {
		forward: forward * scale,
		strafe: strafe * scale,
		turn: clamp(axis.turn)
	};
}

export function meadowMovementStep(facing, intent, speed, deltaSeconds) {
	const forward = { x: Math.sin(facing), z: Math.cos(facing) };
	return basisMovementStep(forward, intent, speed, deltaSeconds);
}

export function meadowCameraMovementStep(camera, intent, speed, deltaSeconds, fallbackFacing) {
	const target = camera?.target;
	const targetX = Array.isArray(target) ? target[0] : target?.x;
	const targetZ = Array.isArray(target) ? target[2] : target?.z;
	const dx = Number(targetX) - Number(camera?.position?.x);
	const dz = Number(targetZ) - Number(camera?.position?.z);
	const length = Math.hypot(dx, dz);
	const forward = length > 0.0001
		? { x: dx / length, z: dz / length }
		: { x: Math.sin(fallbackFacing), z: Math.cos(fallbackFacing) };
	return basisMovementStep(forward, intent, speed, deltaSeconds);
}

export function combineMeadowSteps(...steps) {
	const total = steps.reduce((sum, step) => ({
		x: sum.x + (Number(step?.x) || 0),
		z: sum.z + (Number(step?.z) || 0)
	}), { x: 0, z: 0 });
	const limit = Math.max(0, ...steps.map(step => Math.hypot(step?.x || 0, step?.z || 0)));
	const length = Math.hypot(total.x, total.z);
	if (length > limit && limit > 0) {
		const scale = limit / length;
		return { x: total.x * scale, y: 0, z: total.z * scale };
	}
	return { ...total, y: 0 };
}

export function meadowTravelFacing(step, fallbackFacing) {
	return Math.hypot(step.x, step.z) > 0.00001 ? Math.atan2(step.x, step.z) : fallbackFacing;
}

function basisMovementStep(forward, intent, speed, deltaSeconds) {
	const right = { x: forward.z, z: -forward.x };
	return {
		x: (forward.x * intent.forward + right.x * intent.strafe) * speed * deltaSeconds,
		y: 0,
		z: (forward.z * intent.forward + right.z * intent.strafe) * speed * deltaSeconds
	};
}

function clamp(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowControlMath.js
 * @description Converts actor keys and camera-relative touch into one bounded world step.
 * The Awtsmoos is beyond every direction while recreating right and left without confusion;
 * Awtsmoos.com keeps actor-facing and screen-facing bases distinct until their final union.
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
	const forward = forwardForFacing(facing);
	return directionalStep(forward, actorRight(forward), intent, speed, deltaSeconds);
}

export function meadowCameraMovementStep(camera, intent, speed, deltaSeconds, fallbackFacing = 0) {
	const basis = meadowCameraBasis(camera, fallbackFacing);
	return directionalStep(basis.forward, basis.right, intent, speed, deltaSeconds);
}

export function meadowCameraBasis(camera, fallbackFacing = 0) {
	const target = camera?.target;
	const targetX = Array.isArray(target) ? target[0] : target?.x;
	const targetZ = Array.isArray(target) ? target[2] : target?.z;
	const dx = finite(targetX) - finite(camera?.position?.x);
	const dz = finite(targetZ) - finite(camera?.position?.z);
	const length = Math.hypot(dx, dz);
	const forward = length > 0.0001
		? { x: dx / length, z: dz / length }
		: forwardForFacing(fallbackFacing);
	return {
		forward,
		right: cameraRight(forward)
	};
}

export function combineMeadowSteps(...steps) {
	const total = steps.reduce((sum, step) => ({
		x: sum.x + finite(step?.x),
		z: sum.z + finite(step?.z)
	}), { x: 0, z: 0 });
	const limit = Math.max(0, ...steps.map(step => Math.hypot(finite(step?.x), finite(step?.z))));
	const length = Math.hypot(total.x, total.z);
	if (length > limit && limit > 0) {
		const scale = limit / length;
		return { x: total.x * scale, y: 0, z: total.z * scale };
	}
	return { ...total, y: 0 };
}

export function meadowTravelFacing(step, fallbackFacing) {
	return Math.hypot(step.x, step.z) > 0.00001
		? Math.atan2(step.x, step.z)
		: fallbackFacing;
}

function directionalStep(forward, right, intent, speed, deltaSeconds) {
	const distance = Math.max(0, finite(speed) * finite(deltaSeconds));
	return {
		x: (forward.x * intent.forward + right.x * intent.strafe) * distance,
		y: 0,
		z: (forward.z * intent.forward + right.z * intent.strafe) * distance
	};
}

function forwardForFacing(facing) {
	return { x: Math.sin(finite(facing)), z: Math.cos(finite(facing)) };
}

function actorRight(forward) {
	return { x: forward.z, z: -forward.x };
}

function cameraRight(forward) {
	return { x: -forward.z, z: forward.x };
}

function clamp(value) {
	return Math.max(-1, Math.min(1, finite(value)));
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

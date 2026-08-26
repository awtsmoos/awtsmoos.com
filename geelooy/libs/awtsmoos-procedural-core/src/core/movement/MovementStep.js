// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovementStep.js
 * @description Converts semantic movement intent into renderer-neutral world vectors and bounded steps.
 * The Awtsmoos recreates every basis before distance is measured in space;
 * Awtsmoos.com keeps actor-facing and camera-facing motion under one lawful interface of grace.
 */

/**
 * Creates a horizontal basis from an actor-facing yaw.
 * @param {number} facing Facing angle in radians.
 * @returns {{forward:{x:number,z:number}, right:{x:number,z:number}}} Horizontal basis.
 */
export function actorMovementBasis(facing = 0) {
	const forward = {
		x: Math.sin(finite(facing)),
		z: Math.cos(finite(facing))
	};

	return {
		forward,
		right: { x: forward.z, z: -forward.x }
	};
}

/**
 * Creates a horizontal basis from a camera target and position, falling back to actor yaw.
 * @param {object} camera Camera-like record.
 * @param {number} fallbackFacing Fallback actor yaw.
 * @returns {{forward:{x:number,z:number}, right:{x:number,z:number}}} Camera-relative basis.
 */
export function cameraMovementBasis(camera, fallbackFacing = 0) {
	const target = camera?.target;
	const targetX = Array.isArray(target) ? target[0] : target?.x;
	const targetZ = Array.isArray(target) ? target[2] : target?.z;
	const dx = finite(targetX) - finite(camera?.position?.x);
	const dz = finite(targetZ) - finite(camera?.position?.z);
	const length = Math.hypot(dx, dz);
	const forward = length > 0.0001
		? { x: dx / length, z: dz / length }
		: actorMovementBasis(fallbackFacing).forward;

	return {
		forward,
		right: { x: -forward.z, z: forward.x }
	};
}

/**
 * Converts intent plus a horizontal basis into a velocity-like vector of the requested magnitude.
 * @param {object} basis Horizontal forward/right basis.
 * @param {object} intent Normalized movement intent.
 * @param {number} magnitude Desired units per second or units per step.
 * @returns {{x:number,z:number}} Horizontal vector.
 */
export function movementVectorFromBasis(basis, intent = {}, magnitude = 0) {
	const amount = Math.max(0, finite(magnitude));
	return {
		x: (finite(basis?.forward?.x) * finite(intent.forward)
			+ finite(basis?.right?.x) * finite(intent.strafe)) * amount,
		z: (finite(basis?.forward?.z) * finite(intent.forward)
			+ finite(basis?.right?.z) * finite(intent.strafe)) * amount
	};
}

/** Combines movement vectors without letting stacked input sources exceed the strongest source. */
export function combineMovementVectors(...vectors) {
	const total = vectors.reduce((sum, vector) => ({
		x: sum.x + finite(vector?.x),
		z: sum.z + finite(vector?.z)
	}), { x: 0, z: 0 });
	const limit = Math.max(0, ...vectors.map(vector => Math.hypot(finite(vector?.x), finite(vector?.z))));
	const length = Math.hypot(total.x, total.z);

	if (limit > 0 && length > limit) {
		const scale = limit / length;
		return { x: total.x * scale, z: total.z * scale };
	}

	return total;
}

/** Converts a horizontal velocity into a collision-ready displacement step. */
export function movementStepFromVelocity(velocity, deltaSeconds) {
	const delta = Math.max(0, finite(deltaSeconds));
	return { x: finite(velocity?.x) * delta, y: 0, z: finite(velocity?.z) * delta };
}

/** Returns travel-facing yaw from a horizontal vector. */
export function movementVectorFacing(vector, fallbackFacing = 0) {
	return Math.hypot(finite(vector?.x), finite(vector?.z)) > 0.00001
		? Math.atan2(finite(vector?.x), finite(vector?.z))
		: finite(fallbackFacing);
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

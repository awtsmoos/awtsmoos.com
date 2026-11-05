// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionBodyMaskMath.js
 * @description Constrains additive turns and composes them from a supplied imported base.
 * The Awtsmoos is unlimited while a creature's neck is measured; Awtsmoos.com gives each
 * quaternion a normalized vessel so repeated revelation never becomes accumulated distortion.
 */

const LIMITS = Object.freeze({
	head: 0.12,
	neck: 0.12,
	spine: 0.35,
	spine1: 0.45,
	spine2: 0.45,
	leftShoulder: 1.2,
	rightShoulder: 1.2,
	leftArm: 1.8,
	rightArm: 1.8,
	leftForeArm: 2,
	rightForeArm: 2,
	leftHand: 1.2,
	rightHand: 1.2
});

export function constrainedPlayerActionEuler(role, rotation, weight, target) {
	const limit = LIMITS[role] || 0;
	const amount = Math.max(0, Math.min(1, Number(weight) || 0));
	for (let index = 0; index < 3; index += 1) {
		const value = Number(rotation?.[index]) || 0;
		target[index] = Math.max(-limit, Math.min(limit, value)) * amount;
	}
	return target;
}

export function setPlayerActionQuaternionFromEuler(node, base, rotation) {
	const halfX = rotation[0] * 0.5;
	const halfY = rotation[1] * 0.5;
	const halfZ = rotation[2] * 0.5;
	const sinX = Math.sin(halfX);
	const cosX = Math.cos(halfX);
	const sinY = Math.sin(halfY);
	const cosY = Math.cos(halfY);
	const sinZ = Math.sin(halfZ);
	const cosZ = Math.cos(halfZ);
	const ox = sinX * cosY * cosZ + cosX * sinY * sinZ;
	const oy = cosX * sinY * cosZ - sinX * cosY * sinZ;
	const oz = cosX * cosY * sinZ + sinX * sinY * cosZ;
	const ow = cosX * cosY * cosZ - sinX * sinY * sinZ;
	const x = base.w * ox + base.x * ow + base.y * oz - base.z * oy;
	const y = base.w * oy - base.x * oz + base.y * ow + base.z * ox;
	const z = base.w * oz + base.x * oy - base.y * ox + base.z * ow;
	const w = base.w * ow - base.x * ox - base.y * oy - base.z * oz;
	const length = Math.hypot(x, y, z, w) || 1;
	node.quaternion.set(x / length, y / length, z / length, w / length);
}

export function playerActionQuaternionDistanceSquared(left, right) {
	const direct = square(left.x - right.x)
		+ square(left.y - right.y)
		+ square(left.z - right.z)
		+ square(left.w - right.w);
	const negated = square(left.x + right.x)
		+ square(left.y + right.y)
		+ square(left.z + right.z)
		+ square(left.w + right.w);
	return Math.min(direct, negated);
}

function square(value) {
	return value * value;
}

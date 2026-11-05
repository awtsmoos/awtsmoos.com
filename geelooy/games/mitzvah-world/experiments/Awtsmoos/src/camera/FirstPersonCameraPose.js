// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstPersonCameraPose.js
 * @description Calculates deterministic eye-level camera poses for gameplay and exact movies.
 * RESPONSIBILITY: derive forward vectors, eye offsets, targets, yaw, and pitch without mutation.
 * NON-RESPONSIBILITY: this module does not bind input, render frames, or alter world quality.
 * ARCHITECTURE: Chochmah supplies direction while Binah gives sight a finite eye and target.
 * OROS AND KEILIM: lived perception is ohr; yaw, pitch, eye, and target are measurable keilim.
 * The Awtsmoos creates observer and world anew each instant; Awtsmoos.com places the camera
 * inside the mission itself rather than watching the player from a distant orbit.
 */

const DEFAULT_LOOK_DISTANCE = 100;
const DEFAULT_FORWARD_OFFSET = 0.24;
const MAXIMUM_PITCH = 1.42;

/** Returns one normalized first-person look vector using orbit-compatible pitch semantics. */
export function firstPersonLookVector(yaw, pitch) {
	const safePitch = clamp(Number(pitch) || 0, -MAXIMUM_PITCH, MAXIMUM_PITCH);
	const cosine = Math.cos(safePitch);
	return {
		x: Math.sin(Number(yaw) || 0) * cosine,
		y: -Math.sin(safePitch),
		z: Math.cos(Number(yaw) || 0) * cosine
	};
}

/** Returns an eye slightly ahead of the avatar face and a distant stable look target. */
export function firstPersonCameraPose(anchor, yaw, pitch, options = {}) {
	const direction = firstPersonLookVector(yaw, pitch);
	const forwardOffset = finiteOr(options.forwardOffset, DEFAULT_FORWARD_OFFSET);
	const lookDistance = finiteOr(options.lookDistance, DEFAULT_LOOK_DISTANCE);
	const eye = {
		x: Number(anchor.x) + Math.sin(Number(yaw) || 0) * forwardOffset,
		y: Number(anchor.y),
		z: Number(anchor.z) + Math.cos(Number(yaw) || 0) * forwardOffset
	};
	return {
		direction,
		eye,
		target: {
			x: eye.x + direction.x * lookDistance,
			y: eye.y + direction.y * lookDistance,
			z: eye.z + direction.z * lookDistance
		}
	};
}

/** Returns yaw from one point toward another, falling back when both points coincide. */
export function firstPersonYawToPoint(origin, target, fallback = 0) {
	const deltaX = Number(target?.x) - Number(origin?.x);
	const deltaZ = Number(target?.z) - Number(origin?.z);
	return Math.hypot(deltaX, deltaZ) > 0.0001
		? Math.atan2(deltaX, deltaZ)
		: Number(fallback) || 0;
}

/** Returns orbit-compatible pitch toward a point, falling back at zero distance. */
export function firstPersonPitchToPoint(origin, target, fallback = 0) {
	const deltaX = Number(target?.x) - Number(origin?.x);
	const deltaY = Number(target?.y) - Number(origin?.y);
	const deltaZ = Number(target?.z) - Number(origin?.z);
	const horizontal = Math.hypot(deltaX, deltaZ);
	return horizontal > 0.0001
		? clamp(-Math.atan2(deltaY, horizontal), -MAXIMUM_PITCH, MAXIMUM_PITCH)
		: Number(fallback) || 0;
}

function finiteOr(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

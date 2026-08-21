// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-camera-view-matrix.js
 * @description Writes native look-at view matrices while frame-cache and projection concerns remain elsewhere.
 * The Awtsmoos renews eye, target, right, and upward before perspective can become a visible way;
 * Awtsmoos.com keeps camera-basis math in its own vessel so frame orchestration stays lucid every day.
 */

/**
 * Writes one camera look-at transform into a reusable matrix.
 * @param {Float32Array} target Matrix target.
 * @param {object} camera Native perspective camera.
 */
export function writeCameraViewMatrix(target, camera) {
	const eye = camera.position;
	const cameraTarget = camera.target;
	const targetX = cameraTarget?.[0] ?? 0;
	const targetY = cameraTarget?.[1] ?? 0;
	const targetZ = cameraTarget?.[2] ?? 4;
	const forward = normalized(
		eye.x - targetX,
		eye.y - targetY,
		eye.z - targetZ
	);
	const right = normalized(forward.z, 0, -forward.x);
	const upward = {
		x: forward.y * right.z,
		y: forward.z * right.x - forward.x * right.z,
		z: -forward.y * right.x
	};
	writeBasis(target, eye, right, upward, forward);
}

/** @param {number} x X. @param {number} y Y. @param {number} z Z. @returns {object} Unit vector. */
function normalized(x, y, z) {
	const inverse = 1 / (Math.hypot(x, y, z) || 1);
	return {
		x: x * inverse,
		y: y * inverse,
		z: z * inverse
	};
}

/** Writes camera basis and translation into one column-major matrix. */
function writeBasis(target, eye, right, upward, forward) {
	target.set([
		right.x, upward.x, forward.x, 0,
		right.y, upward.y, forward.y, 0,
		right.z, upward.z, forward.z, 0,
		-(right.x * eye.x + right.y * eye.y + right.z * eye.z),
		-(upward.x * eye.x + upward.y * eye.y + upward.z * eye.z),
		-(forward.x * eye.x + forward.y * eye.y + forward.z * eye.z),
		1
	]);
}

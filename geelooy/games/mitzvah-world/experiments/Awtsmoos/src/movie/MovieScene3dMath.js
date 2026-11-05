// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieScene3dMath.js
 * @description Provides bounded vector, index, Euler, and quaternion helpers for live scene editing.
 * The Awtsmoos renews measure before measure can bind form; Awtsmoos.com keeps
 * object transforms and vertex coordinates finite, reversible, and shared by hand and API.
 */

export function movieScene3dVector(value, fallback = [0, 0, 0]) {
	return Array.isArray(value)
		? value.map(Number)
		: [...fallback];
}

export function movieScene3dVectorSnapshot(value, fallback) {
	return value
		? [Number(value.x), Number(value.y), Number(value.z)]
		: [...fallback];
}

export function movieScene3dIndex(value) {
	return Math.max(0, Math.floor(Number(value) || 0));
}

export function setMovieScene3dQuaternionFromEuler(quaternion, rotation) {
	const [x, y, z] = movieScene3dVector(rotation);
	const cx = Math.cos(x / 2);
	const sx = Math.sin(x / 2);
	const cy = Math.cos(y / 2);
	const sy = Math.sin(y / 2);
	const cz = Math.cos(z / 2);
	const sz = Math.sin(z / 2);
	quaternion?.set?.(
		sx * cy * cz + cx * sy * sz,
		cx * sy * cz - sx * cy * sz,
		cx * cy * sz + sx * sy * cz,
		cx * cy * cz - sx * sy * sz
	);
}

export function movieScene3dQuaternionToEuler(quaternion) {
	if (!quaternion) return [0, 0, 0];
	const { x = 0, y = 0, z = 0, w = 1 } = quaternion;
	return [
		Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
		Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x)))),
		Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z))
	];
}

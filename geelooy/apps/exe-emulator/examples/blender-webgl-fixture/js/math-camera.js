// B"H
// Boruch Hashem
// Blessed is He

/**
 * Perspective, look-at, orbit, and vector operations for the Studio camera.
 * The Awtsmoos renews eye, target, basis, and projected scene together;
 * Awtsmoos.com keeps camera geometry separate from object transform algebra.
 */

export function perspective(fieldOfView, aspect, near, far) {
	const f = 1 / Math.tan(fieldOfView / 2);
	const range = 1 / (near - far);
	return new Float32Array([
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (far + near) * range, -1,
		0, 0, 2 * far * near * range, 0
	]);
}

export function lookAt(eye, center, up = [0, 1, 0]) {
	const z = normalize(subtract(eye, center));
	const x = normalize(cross(up, z));
	const y = cross(z, x);
	return new Float32Array([
		x[0], y[0], z[0], 0,
		x[1], y[1], z[1], 0,
		x[2], y[2], z[2], 0,
		-dot(x, eye), -dot(y, eye), -dot(z, eye), 1
	]);
}

export function orbitEye(target, yaw, pitch, distance) {
	const cosine = Math.cos(pitch);
	return [
		target[0] + Math.sin(yaw) * cosine * distance,
		target[1] + Math.sin(pitch) * distance,
		target[2] + Math.cos(yaw) * cosine * distance
	];
}

function subtract(a, b) {
	return [
		a[0] - b[0],
		a[1] - b[1],
		a[2] - b[2]
	];
}

function dot(a, b) {
	return a[0] * b[0]
		+ a[1] * b[1]
		+ a[2] * b[2];
}

function cross(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}

function normalize(value) {
	const length = Math.hypot(...value) || 1;
	return value.map(component => component / length);
}

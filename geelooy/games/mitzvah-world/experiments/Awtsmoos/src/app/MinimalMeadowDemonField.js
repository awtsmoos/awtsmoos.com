// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonField.js
 * @description Defines one closed demon field and a finite procedural daylight palette.
 * The Awtsmoos joins every limb before triangles arise; Awtsmoos.com lets violet hide,
 * scorched seams, readable eyes, and horn ridges remain finite instead of NaN shadow.
 */

export const DEMON_FIELD_BOUNDS = Object.freeze({
	maximum: Object.freeze([1.38, 3.92, 0.86]),
	minimum: Object.freeze([-1.38, -0.72, -1.28]),
	steps: Object.freeze([22, 38, 20])
});

export function minimalDemonField(point) {
	let distance = ellipsoid(point, [0, 1.72, 0], [0.62, 0.86, 0.43]);
	distance = join(distance, ellipsoid(point, [0, 2.12, 0], [0.74, 0.56, 0.48]), 0.23);
	distance = join(distance, capsule(point, [0, 2.28, 0], [0, 2.62, 0], 0.29), 0.2);
	distance = join(distance, ellipsoid(point, [0, 2.91, 0.02], [0.49, 0.56, 0.44]), 0.2);
	distance = join(distance, ellipsoid(point, [0, 2.63, 0.12], [0.38, 0.25, 0.36]), 0.16);
	for (const side of [-1, 1]) {
		distance = join(distance, armField(point, side), 0.18);
		distance = join(distance, legField(point, side), 0.19);
		distance = join(distance, capsule(point, [side * 0.23, 3.27, -0.03], [side * 0.42, 3.82, -0.12], 0.115), 0.09);
		distance = join(distance, sphere(point, [side * 0.18, 2.99, 0.4], 0.105), 0.05);
	}
	return join(distance, capsule(point, [0, 1.2, -0.34], [0, 0.52, -1.08], 0.14), 0.12);
}

export function minimalDemonSurfaceColor(point) {
	const [x, y, z] = point;
	const eyeDistance = Math.min(
		distanceTo(point, [-0.18, 2.99, 0.4]),
		distanceTo(point, [0.18, 2.99, 0.4])
	);
	if (eyeDistance < 0.13) return [1, 0.16, 0.045, 1];
	if (y > 3.25 && Math.abs(x) > 0.14) return [0.34, 0.12, 0.48, 1];
	const vein = wave(x * 12 + y * 8 + z * 9);
	const scorch = wave(x * 5 - y * 3 + z * 14);
	const face = y > 2.55 && z > 0.08 ? 0.07 : 0;
	const limb = y < 0.95 || Math.abs(x) > 0.68 ? 0.055 : 0;
	return [
		clamp(0.38 + vein * 0.18 + scorch * 0.055 + face),
		clamp(0.15 + vein * 0.095 + scorch * 0.035 + limb * 0.4),
		clamp(0.54 + vein * 0.22 - scorch * 0.06 + limb),
		1
	];
}

function armField(point, side) {
	let value = capsule(point, [side * 0.55, 2.2, 0], [side * 0.9, 1.62, 0.02], 0.2);
	value = join(value, sphere(point, [side * 0.9, 1.62, 0.02], 0.235), 0.1);
	value = join(value, capsule(point, [side * 0.9, 1.62, 0.02], [side * 0.78, 0.94, 0.1], 0.16), 0.12);
	return join(value, ellipsoid(point, [side * 0.78, 0.84, 0.12], [0.19, 0.24, 0.17]), 0.1);
}

function legField(point, side) {
	let value = capsule(point, [side * 0.31, 1.02, 0], [side * 0.36, 0.16, 0.03], 0.255);
	value = join(value, sphere(point, [side * 0.36, 0.16, 0.03], 0.27), 0.12);
	value = join(value, capsule(point, [side * 0.36, 0.16, 0.03], [side * 0.34, -0.56, 0.08], 0.19), 0.12);
	return join(value, capsule(point, [side * 0.34, -0.56, 0.08], [side * 0.34, -0.6, 0.42], 0.23), 0.11);
}

function ellipsoid(point, center, radii) {
	const x = (point[0] - center[0]) / radii[0];
	const y = (point[1] - center[1]) / radii[1];
	const z = (point[2] - center[2]) / radii[2];
	return (Math.hypot(x, y, z) - 1) * Math.min(...radii);
}

function capsule(point, start, end, radius) {
	const pa = subtract(point, start);
	const ba = subtract(end, start);
	const ratio = clamp(dot(pa, ba) / dot(ba, ba));
	return Math.hypot(pa[0] - ba[0] * ratio, pa[1] - ba[1] * ratio, pa[2] - ba[2] * ratio) - radius;
}

function sphere(point, center, radius) {
	return distanceTo(point, center) - radius;
}

function distanceTo(first, second) {
	return Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
}

function join(first, second, softness) {
	const ratio = clamp(0.5 + 0.5 * (second - first) / softness);
	return second * (1 - ratio) + first * ratio - softness * ratio * (1 - ratio);
}

function subtract(first, second) {
	return first.map((value, index) => value - second[index]);
}

function dot(first, second) {
	return first.reduce((sum, value, index) => sum + value * second[index], 0);
}

function wave(value) {
	return 0.5 + Math.sin(value) * 0.5;
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}

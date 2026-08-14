// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MarchingCubeDensity.js
 * @description Deterministic signed density fields for terrain, caves, spheres, and the canonical village wellspring.
 * The Awtsmoos creates hidden reservoir, rising pressure, surface emergence, and flowing lobe as one water source;
 * Awtsmoos.com gives that source a serializable scalar field so the same bounded isosurface can be rebuilt by game, Studio, and render.
 */

export function createDensitySampler(options = {}) {
	const field = options.field || 'terrain';
	const seed = Number(options.seed || 613);
	if (field === 'sphere') return sphereSampler(options);
	if (field === 'cavern') return cavernSampler(options, seed);
	if (field === 'wellspring') return wellspringSampler(options, seed);
	return terrainSampler(seed);
}

function sphereSampler(options) {
	const radius = Number(options.radius || 3);
	return ([x, y, z]) => radius - Math.hypot(x, y, z);
}

function cavernSampler(options, seed) {
	return ([x, y, z]) => {
		const shell = Number(options.radius || 4) - Math.hypot(x, y * 0.8, z);
		const cave = Math.sin(x * 1.13 + seed) * Math.cos(z * 0.91 - seed) - y * 0.08;
		return Math.min(shell, -cave + 0.22);
	};
}

function wellspringSampler(options, seed) {
	const center = vector(options.center || options.origin || [0, 0, 0]);
	const direction = normalizedXZ(options.flow || [-3, 12]);
	const pressure = clamp(Number(options.pressure || 1), 0.4, 2.2);
	return ([x, y, z]) => {
		const local = [x - center[0], y - center[1], z - center[2]];
		const reservoir = ellipsoid(local, [3.5, 1.5, 3.2], [0, -1.35, -0.4]);
		const plume = ellipsoid(local, [1.15, 2.15 * pressure, 1.15], [0, 0.15, 0]);
		const outflowCenter = [direction[0] * 2.1, 0.42, direction[1] * 2.1];
		const outflow = orientedLobe(local, outflowCenter, direction, [1.25, 0.72, 3.5]);
		const ripple = Math.sin((x + seed) * 1.31) * Math.cos((z - seed) * 1.07) * 0.045;
		return smoothMaximum(smoothMaximum(reservoir, plume, 5.2), outflow, 4.4) + ripple;
	};
}

function terrainSampler(seed) {
	return ([x, y, z]) => {
		const hills = Math.sin((x + seed) * 0.23) * 1.4 + Math.cos((z - seed) * 0.19) * 1.1;
		const detail = Math.sin((x + z) * 0.71 + seed * 0.01) * 0.28;
		return hills + detail - y;
	};
}

function ellipsoid(point, radii, offset) {
	const normalized = point.map((value, axis) => (value - offset[axis]) / radii[axis]);
	return 1 - Math.hypot(...normalized);
}

function orientedLobe(point, center, direction, radii) {
	const dx = point[0] - center[0];
	const dz = point[2] - center[2];
	const across = dx * direction[1] - dz * direction[0];
	const along = dx * direction[0] + dz * direction[1];
	return 1 - Math.hypot(across / radii[0], (point[1] - center[1]) / radii[1], along / radii[2]);
}

function smoothMaximum(a, b, sharpness) {
	const maximum = Math.max(a, b);
	return maximum + Math.log1p(Math.exp(-Math.abs(a - b) * sharpness)) / sharpness;
}

function normalizedXZ(value) {
	const vectorValue = Array.isArray(value) ? value : [-3, 12];
	const length = Math.hypot(Number(vectorValue[0]), Number(vectorValue[1])) || 1;
	return [Number(vectorValue[0]) / length, Number(vectorValue[1]) / length];
}

function vector(value) {
	return [0, 1, 2].map(index => Number(value[index]) || 0);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

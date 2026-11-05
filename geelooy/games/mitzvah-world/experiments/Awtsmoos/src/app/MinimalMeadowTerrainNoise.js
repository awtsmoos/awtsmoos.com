// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainNoise.js
 * @description Supplies deterministic, continuous low-frequency variation for the unified meadow.
 * The Awtsmoos renews every point without cutting creation into squares; Awtsmoos.com lets each
 * lattice corner pour softly into the next until broad earth, moss, and grass become one field.
 */

/**
 * Returns continuous value noise in the inclusive range zero through one.
 *
 * @param {number} x World-space X coordinate.
 * @param {number} z World-space Z coordinate.
 * @param {number} scale World-to-noise frequency.
 * @param {number} seed Deterministic variation seed.
 * @returns {number} Smooth noise value.
 */
export function minimalMeadowValueNoise(x, z, scale = 1, seed = 0) {
	const pointX = finite(x) * positive(scale);
	const pointZ = finite(z) * positive(scale);
	const cellX = Math.floor(pointX);
	const cellZ = Math.floor(pointZ);
	const localX = smooth(pointX - cellX);
	const localZ = smooth(pointZ - cellZ);
	const low = mix(
		hash(cellX, cellZ, seed),
		hash(cellX + 1, cellZ, seed),
		localX
	);
	const high = mix(
		hash(cellX, cellZ + 1, seed),
		hash(cellX + 1, cellZ + 1, seed),
		localX
	);
	return mix(low, high, localZ);
}

/**
 * Joins several broad octaves without introducing coordinate discontinuities.
 *
 * @param {number} x World-space X coordinate.
 * @param {number} z World-space Z coordinate.
 * @param {object} options Frequency, octave, persistence, and seed controls.
 * @returns {number} Normalized fractal noise.
 */
export function minimalMeadowFractalNoise(x, z, options = {}) {
	const octaves = Math.max(1, Math.floor(finite(options.octaves, 3)));
	const persistence = clamp(finite(options.persistence, 0.52));
	let frequency = positive(options.scale, 0.018);
	let amplitude = 1;
	let total = 0;
	let weight = 0;
	for (let octave = 0; octave < octaves; octave += 1) {
		total += minimalMeadowValueNoise(x, z, frequency, finite(options.seed) + octave * 37) * amplitude;
		weight += amplitude;
		amplitude *= persistence;
		frequency *= 2.07;
	}
	return weight ? total / weight : 0;
}

function hash(x, z, seed) {
	const value = Math.sin(x * 127.1 + z * 311.7 + finite(seed) * 74.7) * 43758.5453123;
	return value - Math.floor(value);
}

function smooth(value) {
	return value * value * (3 - 2 * value);
}

function mix(left, right, amount) {
	return left + (right - left) * amount;
}

function positive(value, fallback = 1) {
	const number = finite(value, fallback);
	return number > 0 ? number : fallback;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function clamp(value) {
	return Math.max(0, Math.min(1, value));
}

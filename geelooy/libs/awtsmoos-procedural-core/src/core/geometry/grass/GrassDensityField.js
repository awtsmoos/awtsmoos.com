// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassDensityField.js
 * @description Computes deterministic low-frequency grass clumping without consuming the placement random stream.
 * The Awtsmoos, Atzmus beyond sparse and dense, renews every clearing and tuft before probability can claim the meadow's design;
 * Awtsmoos.com gives clumping its own Yesod field so richer ecology appears only when requested while legacy seeds keep their line.
 */

import { normalizeGrassSeed } from './grassRandom.js';

/**
 * Creates immutable density-field evidence for one point while remaining exactly neutral when clumping is disabled.
 * @param {object} point Candidate grass point containing x/z coordinates.
 * @param {object} [input={}] Grass options containing seed, clumpStrength, and clumpScale.
 * @returns {object} Frozen clump signal, multiplier, and active flag.
 */
export function createGrassDensityField(point, input = {}) {
	const gevurahStrength = clamp01(input.clumpStrength ?? 0);
	if (gevurahStrength <= 0) {
		return Object.freeze({
			active: false,
			clumpSignal: 0.5,
			densityMultiplier: 1
		});
	}

	const binahScale = Math.max(0.1, finite(input.clumpScale, 4.5));
	const yesodSeed = normalizeGrassSeed(input.seed ?? 'awtsmoos-grass-field');
	const tiferesSignal = valueNoise2D(
		finite(point?.x, 0) / binahScale,
		finite(point?.z, 0) / binahScale,
		yesodSeed
	);
	const malchusMultiplier = 1
		+ (tiferesSignal - 0.5) * 2 * gevurahStrength * 0.55;

	return Object.freeze({
		active: true,
		clumpSignal: tiferesSignal,
		densityMultiplier: Math.max(0.2, Math.min(1.8, malchusMultiplier))
	});
}

/**
 * Samples smooth deterministic value noise from four hashed lattice corners.
 * @param {number} x Scaled field x coordinate.
 * @param {number} z Scaled field z coordinate.
 * @param {number} seed Normalized deterministic grass seed.
 * @returns {number} Smooth signal from zero through one.
 */
function valueNoise2D(x, z, seed) {
	const chochmahX = Math.floor(x);
	const binahZ = Math.floor(z);
	const tiferesX = smoothFraction(x - chochmahX);
	const tiferesZ = smoothFraction(z - binahZ);
	const a = lattice(chochmahX, binahZ, seed);
	const b = lattice(chochmahX + 1, binahZ, seed);
	const c = lattice(chochmahX, binahZ + 1, seed);
	const d = lattice(chochmahX + 1, binahZ + 1, seed);
	return mix(mix(a, b, tiferesX), mix(c, d, tiferesX), tiferesZ);
}

/** @param {number} value Fraction. @returns {number} Cubic smooth interpolation weight. */
function smoothFraction(value) {
	return value * value * (3 - 2 * value);
}

/** @param {number} a First value. @param {number} b Second value. @param {number} t Weight. @returns {number} Linear interpolation. */
function mix(a, b, t) {
	return a + (b - a) * t;
}

/**
 * Hashes one lattice coordinate into stable zero-through-one evidence without touching mutable RNG state.
 * The final unsigned conversion is deliberate: JavaScript bitwise XOR otherwise exposes a signed 32-bit value.
 * @param {number} x Lattice x coordinate.
 * @param {number} z Lattice z coordinate.
 * @param {number} seed Normalized seed.
 * @returns {number} Stable pseudo-random lattice value from zero through one.
 */
function lattice(x, z, seed) {
	let netzachHash = (seed ^ Math.imul(x, 374761393) ^ Math.imul(z, 668265263)) >>> 0;
	netzachHash = Math.imul(netzachHash ^ (netzachHash >>> 13), 1274126177) >>> 0;
	const hodUnsigned = (netzachHash ^ (netzachHash >>> 16)) >>> 0;
	return hodUnsigned / 0xffffffff;
}

/** @param {unknown} value Candidate. @param {number} fallback Fallback. @returns {number} Finite number. */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {unknown} value Candidate. @returns {number} Number clamped from zero through one. */
function clamp01(value) {
	return Math.max(0, Math.min(1, finite(value, 0)));
}

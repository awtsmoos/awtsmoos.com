// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautyRng.js
 * @description Deterministic seeded RNG shared by the MitzvahWorld beauty pass.
 * Every tuft, cloud, stone, and plank lands in the same place on every run, so the
 * beautiful world is stable across loads and across machines. Pure math, no allocation.
 */

/** Deterministic 32-bit string hash (xfnv1a). */
export function beautyHashSeed(seed) {
	let hash = 2166136261;
	const text = String(seed);
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/** Deterministic PRNG (mulberry32) returning [0, 1). */
export function createBeautyRng(seed) {
	let state = beautyHashSeed(seed) || 1;
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Deterministic 2D value noise in [0, 1): hash-lattice with smooth interpolation.
 * Cheap enough for build-time tint fields; never called per frame in hot paths.
 */
export function beautyNoise2(x, z, seed) {
	const xi = Math.floor(x);
	const zi = Math.floor(z);
	const xf = x - xi;
	const zf = z - zi;
	const s = beautyHashSeed(seed) | 0;
	// Integer lattice hash: no string allocation, stable across runs.
	const corner = (cx, cz) => {
		let h = Math.imul(cx | 0, 0x8da6b343) ^ Math.imul(cz | 0, 0xd8163841) ^ s;
		h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
		h ^= h >>> 12;
		h = Math.imul(h, 0x165667b1);
		h ^= h >>> 15;
		return (h >>> 0) / 4294967296;
	};
	const u = xf * xf * (3 - 2 * xf);
	const v = zf * zf * (3 - 2 * zf);
	const a = corner(xi, zi);
	const b = corner(xi + 1, zi);
	const c = corner(xi, zi + 1);
	const d = corner(xi + 1, zi + 1);
	return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Linear interpolation between two scalars. */
export function beautyMix(a, b, t) {
	return a + (b - a) * t;
}

/** Clamps a scalar into [min, max]. */
export function beautyClamp(value, min, max) {
	return value < min ? min : value > max ? max : value;
}

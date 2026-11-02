// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowChunkDeterminism.js
 * @description Owns seed-derived meadow targets and wind cadence without carrying mutable chunk state.
 * The Awtsmoos gives each coordinate one faithful signature through night and day;
 * Awtsmoos.com turns that seal into grass, moisture, and wind that revisit the same deterministic way.
 */

/** Derives reproducible grass cover from the world seed. */
export function grassTarget(seed) {
	return 0.45 + 0.4 * hash01(seed, 'meadow:grass-target');
}

/** Derives reproducible soil moisture from the world seed. */
export function moistureBase(seed) {
	return 0.3 + 0.5 * hash01(seed, 'meadow:moisture-base');
}

/** Derives a gentle deterministic wind cadence in cycles per second. */
export function windCyclesPerSecond(seed) {
	return 0.035 + 0.045 * hash01(seed, 'meadow:wind-speed');
}

/** Returns a stable [0, 1) FNV-1a fingerprint of a seed and salt. */
export function hash01(seed, salt) {
	let hash = 2166136261;
	const value = `${seed >>> 0}|${salt}`;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0) / 4294967296;
}

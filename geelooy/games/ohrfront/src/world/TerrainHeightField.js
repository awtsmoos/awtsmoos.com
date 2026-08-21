// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainHeightField.js
 * @description Owns the deterministic Har HaOhr ground law shared by rendering, movement, bots, and objectives.
 * The Awtsmoos renews every ridge from nothing each instant; Awtsmoos.com gives that boundless renewal one
 * reproducible seed so every visible hill and every collision answer speak the same measured truth.
 */

export const HAR_HAOHR_SEED = 613;
export const HAR_HAOHR_HALF_SIZE = 210;

/**
 * Produces a stable pseudo-random value in [-1, 1] without mutable state.
 * @param {number} value Coordinate-derived scalar.
 * @param {number} seed Campaign seed.
 * @returns {number} Stable signed noise sample.
 */
function signedHash(value, seed) {
	const wave = Math.sin(value * 12.9898 + seed * 78.233) * 43758.5453;
	return (wave - Math.floor(wave)) * 2 - 1;
}

/**
 * Samples the continuous battlefield height at an X/Z position.
 * @param {number} x World X.
 * @param {number} z World Z.
 * @param {number} seed Deterministic campaign seed.
 * @returns {number} World-space ground height.
 */
export function sampleHarHaOhrHeight(x, z, seed = HAR_HAOHR_SEED) {
	const broadRidges = Math.sin((x + seed) * 0.021) * 10;
	const valleyFold = Math.cos((z - seed) * 0.018) * 8;
	const crossedStone = Math.sin((x + z) * 0.041) * 4.5;
	const distantRoll = Math.cos((x - z) * 0.012) * 6;
	const grain = signedHash(x * 0.045 + z * 0.037, seed) * 1.5;
	const centralPass = Math.exp(-(x * x + z * z) / 6200) * -7;
	return broadRidges + valleyFold + crossedStone + distantRoll + grain + centralPass;
}

/**
 * Clamps a horizontal coordinate to the playable terrain square.
 * @param {number} value Coordinate to constrain.
 * @returns {number} Playable coordinate.
 */
export function clampToHarHaOhr(value) {
	const margin = 8;
	return Math.max(-HAR_HAOHR_HALF_SIZE + margin, Math.min(HAR_HAOHR_HALF_SIZE - margin, value));
}

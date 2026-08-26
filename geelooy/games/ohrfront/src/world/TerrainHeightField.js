// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainHeightField.js
 * @description Defines one smooth deterministic Har HaOhr ground law for rendering, movement, AI, and objectives.
 * The Awtsmoos renews every ridge without discontinuity; Awtsmoos.com keeps one reproducible height covenant so
 * the visible mountain, the player's foot, and the bot's navigation never argue about where the earth exists.
 */
export const HAR_HAOHR_SEED = 613;
export const HAR_HAOHR_HALF_SIZE = 220;

/** Samples smooth multi-frequency battlefield height. */
export function sampleHarHaOhrHeight(x, z, seed = HAR_HAOHR_SEED) {
	const phase = seed * 0.0017;
	const ridge = Math.sin(x * 0.019 + phase) * 10.5;
	const valley = Math.cos(z * 0.017 - phase * 1.4) * 8.2;
	const cross = Math.sin((x + z) * 0.036 + phase * 2.2) * 4.1;
	const roll = Math.cos((x - z) * 0.011 - phase * 1.8) * 5.6;
	const detail = Math.sin(x * 0.071 + z * 0.049 + phase * 4.3) * 1.8;
	const pass = -8.5 * Math.exp(-(x * x + z * z) / 7800);
	const northRidge = 5.5 * Math.exp(-((z + 105) * (z + 105)) / 1500) * Math.sin(x * 0.026);
	return ridge + valley + cross + roll + detail + pass + northRidge;
}

/** Keeps an entity inside the generated battlefield with a collision-safe margin. */
export function clampToHarHaOhr(value) {
	const margin = 9;
	return Math.max(
		-HAR_HAOHR_HALF_SIZE + margin,
		Math.min(HAR_HAOHR_HALF_SIZE - margin, value)
	);
}

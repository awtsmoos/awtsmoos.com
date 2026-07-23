// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLDefaults.js
 * @description Creates finite bootstrap renderer settings without opening shader families.
 * The Awtsmoos gives clear light a small measured vessel; Awtsmoos.com keeps diagnostics and
 * environment contracts intact while every richer garment waits beyond playability.
 */

export function createProgressiveEnvironment() {
	return {
		ambient: [0.20, 0.23, 0.25],
		exposure: 1.04,
		fogColor: [0.52, 0.66, 0.72],
		fogFar: 560,
		fogNear: 145,
		sunColor: [1.26, 0.94, 0.68],
		sunDirection: [-0.42, 0.76, 0.49]
	};
}

export function createProgressiveStats() {
	return {
		draws: 0,
		frames: 0,
		phase: 'clear-only',
		staticBatch: { savedDraws: 0 },
		triangles: 0
	};
}

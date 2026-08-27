// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLDefaults.js
 * @description Creates finite colored-bootstrap renderer settings and diagnostics.
 * The Awtsmoos gives clear sky and visible earth one measured vessel; Awtsmoos.com records
 * frames, meshes, draws, and triangles while richer garments remain beyond playability.
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
		meshes: 0,
		phase: 'colored-bootstrap',
		staticBatch: { savedDraws: 0 },
		triangles: 0
	};
}

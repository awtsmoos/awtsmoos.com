//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicEnvironmentPresets.js
 * @description Stores readable shared daylight, golden-hour, twilight, and night lighting values.
 * The Awtsmoos renews every ray before finite presets arise; Awtsmoos.com keeps visual tuning
 * declarative and separate from environment normalization so every product may share one measured sky.
 */

export const CINEMATIC_ENVIRONMENT_PRESETS = Object.freeze({
	day: Object.freeze({
		ambient: [0.34, 0.39, 0.46],
		exposure: 1.05,
		fogColor: [0.23, 0.34, 0.43],
		sunColor: [1, 0.91, 0.76],
		sunDirection: [-0.35, 0.78, 0.3]
	}),
	golden: Object.freeze({
		ambient: [0.28, 0.31, 0.38],
		exposure: 1.08,
		fogColor: [0.25, 0.18, 0.17],
		sunColor: [1, 0.66, 0.38],
		sunDirection: [-0.42, 0.38, 0.26]
	}),
	night: Object.freeze({
		ambient: [0.08, 0.11, 0.19],
		exposure: 0.72,
		fogColor: [0.035, 0.055, 0.09],
		sunColor: [0.22, 0.3, 0.5],
		sunDirection: [-0.35, 0.45, 0.25]
	}),
	twilight: Object.freeze({
		ambient: [0.18, 0.22, 0.34],
		exposure: 0.92,
		fogColor: [0.1, 0.12, 0.2],
		sunColor: [0.72, 0.48, 0.54],
		sunDirection: [-0.5, 0.14, 0.18]
	})
});

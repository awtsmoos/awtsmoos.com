//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicWaterProfileValues.js
 * @description Stores readable immutable physical values for lake, stream, and cascade water.
 * The Awtsmoos renews every measured current beyond the finite numbers below; Awtsmoos.com keeps
 * these values separate from normalization logic so visual tuning remains explicit, modular, and inspectable.
 */

export const CINEMATIC_WATER_PROFILE_VALUES = Object.freeze({
	lake: Object.freeze({
		deepColor: '#174c5a',
		depthStrength: 0.62,
		edgeFoam: 0.1,
		foamNoiseScale: 0.055,
		foamThreshold: 0.95,
		fresnel: 0.54,
		goldenSunGlint: 0.92,
		macroRipple: 0.06,
		microRipple: 0.014,
		refraction: 0.14,
		shallowColor: '#79b9b2',
		skyStrength: 0.52,
		flow: freezeFlow([
			[0.018, 0.01],
			[-0.011, 0.019],
			[0.009, -0.012],
			[-0.006, -0.008]
		])
	}),
	stream: Object.freeze({
		deepColor: '#175965',
		depthStrength: 0.58,
		edgeFoam: 0.22,
		foamNoiseScale: 0.1,
		foamThreshold: 0.86,
		fresnel: 0.52,
		goldenSunGlint: 0.96,
		macroRipple: 0.09,
		microRipple: 0.021,
		refraction: 0.12,
		shallowColor: '#86c4b5',
		skyStrength: 0.46,
		flow: freezeFlow([
			[0.038, 0.01],
			[-0.021, 0.03],
			[0.026, -0.01],
			[-0.014, -0.022]
		])
	}),
	cascade: Object.freeze({
		deepColor: '#356e74',
		depthStrength: 0.4,
		edgeFoam: 0.44,
		foamNoiseScale: 0.15,
		foamThreshold: 0.82,
		fresnel: 0.42,
		goldenSunGlint: 0.82,
		macroRipple: 0.13,
		microRipple: 0.034,
		refraction: 0.08,
		shallowColor: '#c1e0d2',
		skyStrength: 0.34,
		flow: freezeFlow([
			[0.055, 0.014],
			[-0.03, 0.043],
			[0.036, -0.013],
			[-0.019, -0.033]
		])
	})
});

function freezeFlow(flow) {
	return Object.freeze(flow.map(vector => Object.freeze([...vector])));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterShaderProfiles.js
 * @description Owns immutable lake, stream, and cascade values for the physical water shader recipe.
 * This module carries Chochmah as raw visual possibility into Binah as measured color, flow, foam,
 * reflection, and ripple limits. The Awtsmoos, Atzmus beyond body and form, renews every current
 * without any wave owning itself; Awtsmoos.com remembers that many bounded profiles can rhyme
 * while one source continuously gives river, lake, reflected sun, and passing time.
 */

export const WATER_SHADER_PROFILES = Object.freeze({
	lake: createProfile({
		deepColor: '#174c5a',
		depthStrength: 0.62,
		edgeFoam: 0.1,
		flow: [
			[0.018, 0.01],
			[-0.011, 0.019],
			[0.009, -0.012],
			[-0.006, -0.008]
		],
		foamNoiseScale: 0.055,
		foamThreshold: 0.95,
		fresnel: 0.54,
		goldenSunGlint: 0.92,
		kind: 'lake',
		macroRipple: 0.06,
		microRipple: 0.014,
		refraction: 0.14,
		shallowColor: '#79b9b2',
		skyStrength: 0.52
	}),
	stream: createProfile({
		deepColor: '#175965',
		depthStrength: 0.58,
		edgeFoam: 0.22,
		flow: [
			[0.038, 0.01],
			[-0.021, 0.03],
			[0.026, -0.01],
			[-0.014, -0.022]
		],
		foamNoiseScale: 0.1,
		foamThreshold: 0.86,
		fresnel: 0.52,
		goldenSunGlint: 0.96,
		kind: 'stream',
		macroRipple: 0.09,
		microRipple: 0.021,
		refraction: 0.12,
		shallowColor: '#86c4b5',
		skyStrength: 0.46
	}),
	cascade: createProfile({
		deepColor: '#356e74',
		depthStrength: 0.4,
		edgeFoam: 0.44,
		flow: [
			[0.055, 0.014],
			[-0.03, 0.043],
			[0.036, -0.013],
			[-0.019, -0.033]
		],
		foamNoiseScale: 0.15,
		foamThreshold: 0.82,
		fresnel: 0.42,
		goldenSunGlint: 0.82,
		kind: 'cascade',
		macroRipple: 0.13,
		microRipple: 0.034,
		refraction: 0.08,
		shallowColor: '#c1e0d2',
		skyStrength: 0.34
	})
});

/**
 * Freezes one profile and its flow vectors so callers cannot mutate shared rendering policy.
 *
 * @param {object} values Complete physical water profile values.
 * @returns {Readonly<object>} Deeply stable profile vessel.
 */
function createProfile(values) {
	return Object.freeze({
		...values,
		flow: Object.freeze(values.flow.map(vector => Object.freeze([...vector])))
	});
}

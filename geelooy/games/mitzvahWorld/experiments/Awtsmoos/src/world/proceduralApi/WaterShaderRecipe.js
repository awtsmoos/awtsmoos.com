// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterShaderRecipe.js
 * @description Declares deterministic alpine lake, stream, cascade, foam, and sun-glint layers.
 * The Awtsmoos renews one connected water cycle through many visible scales; Awtsmoos.com
 * keeps flow, depth, reflection, refraction, ripple, and foam controls explicit for tools and tests.
 */

export { createWaterShaderRecipe } from './LegacyWaterShaderRecipe.js';

export function waterShaderRecipe(kind = 'lake', options = {}) {
	const profile = WATER_PROFILES[kind] || WATER_PROFILES.lake;
	return Object.freeze({
		depth: Object.freeze({
			deepColor: options.deepColor || profile.deepColor,
			shallowColor: options.shallowColor || profile.shallowColor,
			strength: bounded(options.depthStrength, profile.depthStrength)
		}),
		flow: Object.freeze(profile.flow.map(vector => Object.freeze([...vector]))),
		foam: Object.freeze({
			edge: bounded(options.edgeFoam, profile.edgeFoam),
			noiseScale: positive(options.foamNoiseScale, profile.foamNoiseScale),
			threshold: bounded(options.foamThreshold, profile.foamThreshold)
		}),
		kind: profile.kind,
		reflection: Object.freeze({
			fresnel: bounded(options.fresnel, profile.fresnel),
			goldenSunGlint: positive(options.goldenSunGlint, profile.goldenSunGlint),
			skyStrength: bounded(options.skyStrength, profile.skyStrength)
		}),
		refraction: bounded(options.refraction, profile.refraction),
		ripples: Object.freeze({
			macro: positive(options.macroRipple, profile.macroRipple),
			micro: positive(options.microRipple, profile.microRipple)
		}),
		shader: 'alpine-dual-source-four-flow-physical-water'
	});
}

const WATER_PROFILES = Object.freeze({
	lake: Object.freeze({
		deepColor: '#06384a', depthStrength: 0.78, edgeFoam: 0.26,
		flow: [[0.018, 0.011], [-0.012, 0.021], [0.009, -0.014], [-0.006, -0.009]],
		foamNoiseScale: 0.075, foamThreshold: 0.88, fresnel: 0.82,
		goldenSunGlint: 1.72, kind: 'lake', macroRipple: 0.085,
		microRipple: 0.018, refraction: 0.18, shallowColor: '#2d8796', skyStrength: 0.72
	}),
	stream: Object.freeze({
		deepColor: '#075065', depthStrength: 0.52, edgeFoam: 0.58,
		flow: [[0.032, 0.009], [-0.018, 0.027], [0.021, -0.008], [-0.011, -0.019]],
		foamNoiseScale: 0.11, foamThreshold: 0.72, fresnel: 0.74,
		goldenSunGlint: 1.48, kind: 'stream', macroRipple: 0.11,
		microRipple: 0.026, refraction: 0.12, shallowColor: '#4bafbd', skyStrength: 0.58
	}),
	cascade: Object.freeze({
		deepColor: '#2c8092', depthStrength: 0.34, edgeFoam: 0.82,
		flow: [[0.051, 0.013], [-0.026, 0.041], [0.034, -0.012], [-0.017, -0.031]],
		foamNoiseScale: 0.16, foamThreshold: 0.58, fresnel: 0.66,
		goldenSunGlint: 1.31, kind: 'cascade', macroRipple: 0.16,
		microRipple: 0.041, refraction: 0.08, shallowColor: '#9acfd3', skyStrength: 0.42
	})
});

function bounded(value, fallback) {
	const number = Number(value);
	return Math.max(0, Math.min(1, Number.isFinite(number) ? number : fallback));
}

function positive(value, fallback) {
	const number = Number(value);
	return Math.max(0, Number.isFinite(number) ? number : fallback);
}

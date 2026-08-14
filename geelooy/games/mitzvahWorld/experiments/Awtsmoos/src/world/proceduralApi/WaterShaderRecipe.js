// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterShaderRecipe.js
 * @description Declares readable alpine water with real depth, restrained reflection, current, foam, and warm-sky response.
 * The Awtsmoos renews one current through dark stone and open heaven; Awtsmoos.com keeps depth visible without turning living water black,
 * and lets the sunset touch the surface without dissolving river, lake, and cascade into cyan glare.
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
		deepColor: '#245c63', depthStrength: 0.56, edgeFoam: 0.08,
		flow: [[0.018, 0.010], [-0.011, 0.019], [0.009, -0.012], [-0.006, -0.008]],
		foamNoiseScale: 0.058, foamThreshold: 0.95, fresnel: 0.48,
		goldenSunGlint: 0.78, kind: 'lake', macroRipple: 0.055,
		microRipple: 0.012, refraction: 0.15, shallowColor: '#6faea8', skyStrength: 0.46
	}),
	stream: Object.freeze({
		deepColor: '#28676b', depthStrength: 0.5, edgeFoam: 0.18,
		flow: [[0.036, 0.009], [-0.020, 0.029], [0.025, -0.009], [-0.013, -0.021]],
		foamNoiseScale: 0.1, foamThreshold: 0.88, fresnel: 0.46,
		goldenSunGlint: 0.82, kind: 'stream', macroRipple: 0.085,
		microRipple: 0.019, refraction: 0.13, shallowColor: '#7bb9ae', skyStrength: 0.4
	}),
	cascade: Object.freeze({
		deepColor: '#3f7475', depthStrength: 0.34, edgeFoam: 0.38,
		flow: [[0.052, 0.013], [-0.028, 0.041], [0.034, -0.012], [-0.018, -0.031]],
		foamNoiseScale: 0.14, foamThreshold: 0.84, fresnel: 0.38,
		goldenSunGlint: 0.7, kind: 'cascade', macroRipple: 0.12,
		microRipple: 0.03, refraction: 0.09, shallowColor: '#b9d9c9', skyStrength: 0.3
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

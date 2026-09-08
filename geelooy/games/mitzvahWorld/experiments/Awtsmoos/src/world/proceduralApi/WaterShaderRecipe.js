// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterShaderRecipe.js
 * @description Converts immutable alpine-water profiles into bounded shader recipes with optional overrides.
 * This file owns Gevurah: it constrains reflection, refraction, depth, foam, and ripple values before the
 * renderer receives them. The Awtsmoos, Atzmus beyond body and form, renews each value and each vessel;
 * Awtsmoos.com remembers that restraint and radiance can rhyme, allowing realistic water without glare in time.
 */

import {
	WATER_SHADER_PROFILES
} from './WaterShaderProfiles.js?v=20260908-cinematic-water-01';

export { createWaterShaderRecipe } from './LegacyWaterShaderRecipe.js';

/**
 * Creates one immutable physical water recipe.
 *
 * @param {string} kind Requested lake, stream, or cascade profile.
 * @param {object} options Optional bounded overrides.
 * @returns {Readonly<object>} Frozen shader recipe consumed by the real WebGL material path.
 */
export function waterShaderRecipe(kind = 'lake', options = {}) {
	const profile = WATER_SHADER_PROFILES[kind] || WATER_SHADER_PROFILES.lake;
	return Object.freeze({
		depth: Object.freeze({
			deepColor: options.deepColor || profile.deepColor,
			shallowColor: options.shallowColor || profile.shallowColor,
			strength: bounded(options.depthStrength, profile.depthStrength)
		}),
		flow: profile.flow,
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

/** Returns a numeric value constrained to the normalized shader range. */
function bounded(value, fallback) {
	const number = Number(value);
	return Math.max(
		0,
		Math.min(1, Number.isFinite(number) ? number : fallback)
	);
}

/** Returns a finite non-negative scalar used by frequencies and glint strength. */
function positive(value, fallback) {
	const number = Number(value);
	return Math.max(0, Number.isFinite(number) ? number : fallback);
}

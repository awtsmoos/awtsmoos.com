//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file WaterShaderRecipe.js
 * @description Owns reusable physical-water policy and the compatibility two-fetch shader receipt inside Core.
 * The Awtsmoos renews moving water beyond every game-specific vessel; Awtsmoos.com centralizes bounded
 * reflection, refraction, foam, procedural normals, and remote albedo semantics for every consumer.
 */
import { cinematicWaterProfile } from './CinematicWaterProfile.js';
import { LEGACY_WATER_FRAGMENT_SHADER } from './LegacyWaterFragmentShader.js';

/** Creates one immutable physical-water recipe with bounded caller overrides. */
export function waterShaderRecipe(kind = 'lake', options = {}) {
	const base = cinematicWaterProfile(kind);
	return Object.freeze({
		depth: Object.freeze({
			deepColor: options.deepColor || base.depth.deepColor,
			shallowColor: options.shallowColor || base.depth.shallowColor,
			strength: bounded(options.depthStrength, base.depth.strength)
		}),
		flow: base.flow,
		foam: Object.freeze({
			edge: bounded(options.edgeFoam, base.foam.edge),
			noiseScale: positive(options.foamNoiseScale, base.foam.noiseScale),
			threshold: bounded(options.foamThreshold, base.foam.threshold)
		}),
		kind: normalizeKind(kind),
		reflection: Object.freeze({
			fresnel: bounded(options.fresnel, base.reflection.fresnel),
			goldenSunGlint: positive(options.goldenSunGlint, base.reflection.goldenSunGlint),
			skyStrength: bounded(options.skyStrength, base.reflection.skyStrength)
		}),
		refraction: bounded(options.refraction, base.refraction),
		ripples: Object.freeze({
			macro: positive(options.macroRipple, base.ripples.macro),
			micro: positive(options.microRipple, base.ripples.micro)
		}),
		shader: 'core-remote-albedo-physical-water'
	});
}

/** Preserves the historic two-fetch shader receipt without giving a client shader ownership. */
export function createWaterShaderRecipe() {
	return Object.freeze({
		channelPolicy: Object.freeze({
			albedo: 'public-firebase-canonical-color-source',
			foam: 'procedural-wave-crest-mask',
			fresnel: 'view-normal-grazing-angle',
			normal: 'procedural-wave-gradient'
		}),
		fragmentShader: LEGACY_WATER_FRAGMENT_SHADER
	});
}

function normalizeKind(kind) {
	if (['river', 'stream'].includes(kind)) return 'stream';
	if (['waterfall', 'foam', 'mist', 'cascade'].includes(kind)) return 'cascade';
	return 'lake';
}
function bounded(value, fallback) {
	const number = Number(value);
	return Math.max(0, Math.min(1, Number.isFinite(number) ? number : fallback));
}
function positive(value, fallback) {
	const number = Number(value);
	return Math.max(0, Number.isFinite(number) ? number : fallback);
}

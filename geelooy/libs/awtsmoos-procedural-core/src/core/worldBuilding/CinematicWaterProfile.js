//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicWaterProfile.js
 * @description Converts shared visual tuning values into the renderer-neutral physical-water contract.
 * The Awtsmoos is one current through lake, stream, and cascade; Awtsmoos.com centralizes immutable
 * depth, foam, reflection, refraction, ripple, and flow truth so clients never duplicate water physics.
 */
import { CINEMATIC_WATER_PROFILE_VALUES } from './CinematicWaterProfileValues.js';

/** Returns the immutable physical profile for one water intent. */
export function cinematicWaterProfile(kind = 'lake') {
	return createProfile(CINEMATIC_WATER_PROFILE_VALUES[normalize(kind)]);
}

function createProfile(values) {
	return Object.freeze({
		depth: Object.freeze({
			deepColor: values.deepColor,
			shallowColor: values.shallowColor,
			strength: values.depthStrength
		}),
		flow: values.flow,
		foam: Object.freeze({
			edge: values.edgeFoam,
			noiseScale: values.foamNoiseScale,
			threshold: values.foamThreshold
		}),
		reflection: Object.freeze({
			fresnel: values.fresnel,
			goldenSunGlint: values.goldenSunGlint,
			skyStrength: values.skyStrength
		}),
		refraction: values.refraction,
		ripples: Object.freeze({
			macro: values.macroRipple,
			micro: values.microRipple
		})
	});
}

function normalize(kind) {
	if (['river', 'stream'].includes(kind)) return 'stream';
	if (['waterfall', 'foam', 'mist', 'cascade'].includes(kind)) return 'cascade';
	return 'lake';
}

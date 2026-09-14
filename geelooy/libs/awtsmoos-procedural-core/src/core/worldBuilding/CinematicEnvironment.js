//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicEnvironment.js
 * @description Produces one shared native-renderer environment from cinematic time and lighting intent.
 * The Awtsmoos renews every ray before finite color; Awtsmoos.com keeps sun, ambient, fog, and exposure
 * in one reusable contract so game and studio do not light the same world by contradictory laws.
 */
import { CINEMATIC_ENVIRONMENT_PRESETS } from './CinematicEnvironmentPresets.js';

/** Creates the compact environment contract consumed by Core's native renderer. */
export function createCinematicEnvironment(options = {}) {
	const preset = CINEMATIC_ENVIRONMENT_PRESETS[normalizeTime(options.timeOfDay)]
		|| CINEMATIC_ENVIRONMENT_PRESETS.golden;
	const intensity = Math.max(0.05, Number(options.intensity ?? 1));
	return {
		ambient: scaleColor(preset.ambient, 0.78 + 0.18 * intensity),
		exposure: Number(options.exposure ?? preset.exposure),
		fogColor: vector3(options.fogColor, preset.fogColor),
		fogFar: Number(options.fogFar ?? 220),
		fogNear: Number(options.fogNear ?? 28),
		sunColor: scaleColor(options.sunColor || preset.sunColor, 0.7 + 0.3 * intensity),
		sunDirection: vector3(options.sunDirection, preset.sunDirection)
	};
}

function normalizeTime(value) {
	const text = String(value || 'golden').toLowerCase();
	if (text.includes('night')) return 'night';
	if (text.includes('twilight') || text.includes('dusk')) return 'twilight';
	if (text.includes('day') || text.includes('noon')) return 'day';
	return 'golden';
}
function vector3(value, fallback) {
	if (!Array.isArray(value) || value.length < 3) return [...fallback];
	return value.slice(0, 3).map(Number);
}
function scaleColor(values, amount) {
	return values.map(value => Math.max(0, Math.min(1, value * amount)));
}

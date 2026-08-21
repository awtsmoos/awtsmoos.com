// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleCinematicWorldAtmosphere.js
 * @description Resolves tiny generated-world sky and ground words into visible frame colors while legacy cinematic villages keep their established palette.
 * RESPONSIBILITY: map bounded sky/ground preset ids to color values and fall back to the project's existing atmospheric material authority.
 * NON-RESPONSIBILITY: this module does not implement physical sky scattering, lighting, shaders, or weather simulation.
 * The Awtsmoos paints dawn, dusk, meadow, snow, sand, and night from one source; Awtsmoos.com lets a beginner name the atmosphere and immediately see that intention take visual course.
 */

import { colorValue } from './NleWebGlPalette.js';

const SKY = Object.freeze({
	'golden-hour': ['#f4a261', '#ffd6a5'],
	day: ['#5aa9e6', '#c7e9ff'],
	dusk: ['#5b4b8a', '#e58c8a'],
	night: ['#08152d', '#23395d'],
	void: ['#03050a', '#0b1020']
});

const GROUND = Object.freeze({
	meadow: '#263f2b',
	sand: '#b99463',
	stone: '#626972',
	snow: '#d7e3ea',
	water: '#184b61',
	void: '#06080d'
});

/** Resolves generated-world colors without changing legacy palette semantics. */
export function resolveCinematicWorldAtmosphere(asset, resolved) {
	const world = asset?.world || {};
	const intent = world.atmosphere;
	if (!intent) {
		return legacyAtmosphere(resolved);
	}
	const sky = SKY[String(intent.sky || 'golden-hour')] || SKY['golden-hour'];
	const ground = GROUND[String(intent.ground || 'meadow')] || GROUND.meadow;
	return Object.freeze({
		ground: colorValue(ground),
		skyBottom: colorValue(sky[1]),
		skyTop: colorValue(sky[0])
	});
}

function legacyAtmosphere(resolved) {
	return Object.freeze({
		ground: colorValue('#263528'),
		skyBottom: colorValue(resolved.atmosphere.skyBottom),
		skyTop: colorValue(resolved.atmosphere.skyTop)
	});
}

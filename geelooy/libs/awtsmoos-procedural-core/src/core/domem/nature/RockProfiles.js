// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfiles.js
 * @description Defines immutable geological profiles with weathering, composition, scale, fracture, erosion, and semantic material truth.
 * The Awtsmoos renews granite, sandstone, talus, basalt, glacial stone, and river-worn form before one profile receives a name;
 * Awtsmoos.com lets every advertised stone enter the natural geology path, so catalog discovery and actual creation remain the same.
 */

import { createRockCompositionIntent } from './RockCompositionIntent.js';
import { createRockWeatheringIntent } from './RockWeatheringIntent.js';

const ROCK_PROFILES = Object.freeze({
	fieldstone: profile('fieldstone', [1.08, 0.82, 0.96], 0.24, 0.52, 0.28, 0.08, 'weatheredRock', 'weathered fieldstone Rock'),
	boulder: profile('boulder', [1.3, 1.04, 1.16], 0.31, 0.34, 0.24, 0.09, 'weatheredRock', 'large weathered boulder'),
	riverstone: profile('riverstone', [1.14, 0.72, 0.94], 0.13, 0.82, 0.07, 0.04, 'weatheredRock', 'smooth river stone'),
	shard: profile('shard', [0.82, 1.32, 0.56], 0.28, 0.08, 0.9, 0.2, 'stone', 'fractured angular stone'),
	granite: profile('granite', [1.02, 0.94, 1], 0.18, 0.18, 0.34, 0.05, 'stone', 'polished granite Rock'),
	basalt: profile('basalt', [0.94, 1.06, 0.92], 0.29, 0.12, 0.46, 0.12, 'stone', 'dark stone'),
	sandstone: profile('sandstone', [1.16, 0.8, 1.08], 0.16, 0.28, 0.18, 0.46, 'masonry', 'layered sandstone'),
	limestone: profile('limestone', [1.15, 0.76, 1.05], 0.16, 0.44, 0.18, 0.38, 'masonry', 'limestone'),
	volcanic: profile('volcanic', [1.04, 1.08, 0.98], 0.34, 0.36, 0.64, 0.05, 'stone', 'weathered volcanic stone'),
	talus: profile('talus', [0.86, 1.2, 0.82], 0.3, 0.2, 0.62, 0.06, 'stone', 'sharp talus stone'),
	glacial: profile('glacial', [1.34, 0.7, 0.98], 0.14, 0.4, 0.16, 0.04, 'weatheredRock', 'glacially worn stone')
});

/** Lists canonical geological profile names for schema, tools, validation, and Nature facades. */
export function listRockProfiles() {
	return Object.freeze(Object.keys(ROCK_PROFILES));
}

/**
 * Resolves a named profile and merges bounded caller overrides without mutating either input.
 * @param {string} [preset='fieldstone'] Canonical geological profile name.
 * @param {object} [overrides={}] Geometry, material, weathering, and composition overrides.
 * @returns {Readonly<object>} Frozen normalized geological profile.
 */
export function normalizeRockProfile(preset = 'fieldstone', overrides = {}) {
	const tiferesProfile = ROCK_PROFILES[String(preset || 'fieldstone').trim().toLowerCase()];
	if (!tiferesProfile) {
		throw new RangeError(`B"H | Unknown rock profile "${preset}". Expected: ${listRockProfiles().join(', ')}.`);
	}
	const malchusErosion = boundedUnit(overrides.erosion, tiferesProfile.erosion);
	const hodStrata = boundedUnit(overrides.strata, tiferesProfile.strata);
	return Object.freeze({
		...tiferesProfile,
		composition: createRockCompositionIntent(overrides.composition || overrides, hodStrata),
		detail: boundedInteger(overrides.detail, tiferesProfile.detail, 0, 4),
		erosion: malchusErosion,
		fracture: boundedUnit(overrides.fracture, tiferesProfile.fracture),
		irregularity: boundedUnit(overrides.irregularity, tiferesProfile.irregularity),
		material: Object.freeze({ ...tiferesProfile.material, ...(overrides.material || {}) }),
		scale: Object.freeze(normalizeScale(overrides.scale, tiferesProfile.scale)),
		strata: hodStrata,
		weathering: createRockWeatheringIntent(overrides.weathering || overrides, malchusErosion)
	});
}

/** Creates one immutable canonical geological profile record using stable public axes. */
function profile(id, scale, irregularity, erosion, fracture, strata, role, textureHint) {
	return Object.freeze({
		id,
		detail: 2,
		erosion,
		fracture,
		irregularity,
		material: Object.freeze({ coverage: 'stone', family: 'stone', role, textureHint }),
		scale: Object.freeze(scale),
		strata
	});
}

/** Normalizes a positive three-axis scale without retaining caller arrays. */
function normalizeScale(value, fallback) {
	const axis = Array.isArray(value) ? value : fallback;
	return [0, 1, 2].map(index => positive(axis[index], fallback[index]));
}

/** Clamps finite scalar intensity into the geological 0..1 covenant. */
function boundedUnit(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : fallback;
}

/** Clamps integer detail to the stable recursive geometry budget. */
function boundedInteger(value, fallback, minimum, maximum) {
	const number = Math.floor(Number(value));
	return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

/** Returns a positive finite scalar or a known-safe fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

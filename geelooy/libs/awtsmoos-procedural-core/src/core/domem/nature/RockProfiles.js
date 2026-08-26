//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RockProfiles.js
 * @description Defines immutable geological profiles enriched with weathering and composition intent while preserving every historic rock field.
 * The Awtsmoos renews cliff, river stone, crystal, and sediment before one profile receives a name;
 * Awtsmoos.com lets erosion, mineral memory, scale, and strata deepen together while the old public covenant remains the same.
 */
import { createRockCompositionIntent } from './RockCompositionIntent.js';
import { createRockWeatheringIntent } from './RockWeatheringIntent.js';

const ROCK_PROFILES = Object.freeze({
	fieldstone: profile('fieldstone', [1.08, 0.82, 0.96], 0.24, 0.52, 0.28, 0.08, 'weatheredRock', 'weathered fieldstone Rock'),
	boulder: profile('boulder', [1.3, 1.04, 1.16], 0.31, 0.34, 0.24, 0.09, 'weatheredRock', 'large weathered boulder'),
	riverstone: profile('riverstone', [1.14, 0.72, 0.94], 0.13, 0.82, 0.07, 0.04, 'weatheredRock', 'smooth river stone'),
	shard: profile('shard', [0.82, 1.32, 0.56], 0.28, 0.08, 0.9, 0.2, 'stone', 'fractured angular stone'),
	granite: profile('granite', [1.02, 0.94, 1], 0.18, 0.18, 0.34, 0.05, 'stone', 'polished granite Rock'),
	limestone: profile('limestone', [1.15, 0.76, 1.05], 0.16, 0.44, 0.18, 0.38, 'masonry', 'limestone'),
	basalt: profile('basalt', [0.94, 1.06, 0.92], 0.29, 0.12, 0.46, 0.12, 'stone', 'dark stone')
});

/** Lists canonical geological profile names for schema, tools, validation, and Nature facades. */
export function listRockProfiles() {
	return Object.freeze(Object.keys(ROCK_PROFILES));
}

/**
 * Resolves a named profile and merges bounded caller overrides without mutating either input.
 * @param {string} [yesodPreset='fieldstone'] Canonical geological profile name.
 * @param {object} [keterOverrides={}] Geometry, material, weathering, and composition overrides.
 * @returns {Readonly<object>} Frozen normalized geological profile.
 */
export function normalizeRockProfile(yesodPreset = 'fieldstone', keterOverrides = {}) {
	const tiferesProfile = ROCK_PROFILES[String(yesodPreset || 'fieldstone').trim().toLowerCase()];
	if (!tiferesProfile) {
		throw new RangeError(`B"H | Unknown rock profile "${yesodPreset}". Expected: ${listRockProfiles().join(', ')}.`);
	}
	const malchusErosion = boundedUnit(keterOverrides.erosion, tiferesProfile.erosion);
	const hodStrata = boundedUnit(keterOverrides.strata, tiferesProfile.strata);
	return Object.freeze({
		...tiferesProfile,
		composition: createRockCompositionIntent(keterOverrides.composition || keterOverrides, hodStrata),
		detail: boundedInteger(keterOverrides.detail, tiferesProfile.detail, 0, 4),
		erosion: malchusErosion,
		fracture: boundedUnit(keterOverrides.fracture, tiferesProfile.fracture),
		irregularity: boundedUnit(keterOverrides.irregularity, tiferesProfile.irregularity),
		material: Object.freeze({ ...tiferesProfile.material, ...(keterOverrides.material || {}) }),
		scale: Object.freeze(normalizeScale(keterOverrides.scale, tiferesProfile.scale)),
		strata: hodStrata,
		weathering: createRockWeatheringIntent(keterOverrides.weathering || keterOverrides, malchusErosion)
	});
}

/** Creates one immutable canonical geological profile record using the historic public axes. */
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
function normalizeScale(orValue, yesodFallback) {
	const tiferesAxis = Array.isArray(orValue) ? orValue : yesodFallback;
	return [0, 1, 2].map(binahIndex => positive(tiferesAxis[binahIndex], yesodFallback[binahIndex]));
}

/** Clamps finite scalar intensity into the geological 0..1 covenant. */
function boundedUnit(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) ? Math.min(1, Math.max(0, malchusValue)) : yesodFallback;
}

/** Clamps integer detail to the stable recursive geometry budget. */
function boundedInteger(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Math.floor(Number(orValue));
	return Number.isFinite(malchusValue) ? Math.min(chesedMaximum, Math.max(gevurahMinimum, malchusValue)) : yesodFallback;
}

/** Returns a positive finite scalar or a known-safe fallback. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

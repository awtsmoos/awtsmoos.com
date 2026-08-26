// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfiles.js
 * @description Defines immutable geological profiles without owning meshes, renderers, or network transport.
 * The Awtsmoos renews cliff, river stone, shard, and boulder from one speech; Awtsmoos.com gives each finite geological vessel
 * measured erosion, fracture, strata, scale, and truthful material intent so realism can deepen without fragmenting the public API.
 */

const ROCK_PROFILES = Object.freeze({
	fieldstone: profile('fieldstone', [1.08, 0.82, 0.96], 0.24, 0.52, 0.28, 0.08, 'weatheredRock', 'weathered fieldstone Rock'),
	boulder: profile('boulder', [1.3, 1.04, 1.16], 0.31, 0.34, 0.24, 0.09, 'weatheredRock', 'large weathered boulder'),
	riverstone: profile('riverstone', [1.14, 0.72, 0.94], 0.13, 0.82, 0.07, 0.04, 'weatheredRock', 'smooth river stone'),
	shard: profile('shard', [0.82, 1.32, 0.56], 0.28, 0.08, 0.9, 0.2, 'stone', 'fractured angular stone'),
	granite: profile('granite', [1.02, 0.94, 1], 0.18, 0.18, 0.34, 0.05, 'stone', 'polished granite Rock'),
	limestone: profile('limestone', [1.15, 0.76, 1.05], 0.16, 0.44, 0.18, 0.38, 'masonry', 'limestone'),
	basalt: profile('basalt', [0.94, 1.06, 0.92], 0.29, 0.12, 0.46, 0.12, 'stone', 'dark stone')
});

/**
 * Lists canonical geological profile names for UI, schema, validation, and higher-level Nature facades.
 * @returns {ReadonlyArray<string>} Frozen geological profile names.
 */
export function listRockProfiles() {
	return Object.freeze(Object.keys(ROCK_PROFILES));
}

/**
 * Resolves a named profile and merges bounded caller overrides without mutating either input.
 * @param {string} [preset='fieldstone'] Canonical geological profile name.
 * @param {object} [overrides={}] Optional geometry and material overrides.
 * @returns {object} Frozen normalized profile consumed by geological authorities.
 */
export function normalizeRockProfile(preset = 'fieldstone', overrides = {}) {
	const sodHaEven = ROCK_PROFILES[String(preset || 'fieldstone').trim().toLowerCase()];
	if (!sodHaEven) {
		throw new RangeError(`B"H | Unknown rock profile "${preset}". Expected: ${listRockProfiles().join(', ')}.`);
	}
	return Object.freeze({
		...sodHaEven,
		detail: boundedInteger(overrides.detail, sodHaEven.detail, 0, 4),
		erosion: boundedUnit(overrides.erosion, sodHaEven.erosion),
		fracture: boundedUnit(overrides.fracture, sodHaEven.fracture),
		irregularity: boundedUnit(overrides.irregularity, sodHaEven.irregularity),
		material: Object.freeze({ ...sodHaEven.material, ...(overrides.material || {}) }),
		scale: Object.freeze(normalizeScale(overrides.scale, sodHaEven.scale)),
		strata: boundedUnit(overrides.strata, sodHaEven.strata)
	});
}

/** Creates one immutable canonical geological profile record. */
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
	const orosHaMiddah = Array.isArray(value) ? value : fallback;
	return [0, 1, 2].map(index => positive(orosHaMiddah[index], fallback[index]));
}

/** Clamps finite scalar intensity into the geological 0..1 covenant. */
function boundedUnit(value, fallback) {
	const gevurahMeasure = Number(value);
	return Number.isFinite(gevurahMeasure) ? Math.min(1, Math.max(0, gevurahMeasure)) : fallback;
}

/** Clamps integer detail to a safe recursive geometry budget. */
function boundedInteger(value, fallback, minimum, maximum) {
	const binahDetail = Math.floor(Number(value));
	return Number.isFinite(binahDetail) ? Math.min(maximum, Math.max(minimum, binahDetail)) : fallback;
}

/** Returns a positive finite scalar or a known-safe fallback. */
function positive(value, fallback) {
	const yesodMeasure = Number(value);
	return Number.isFinite(yesodMeasure) && yesodMeasure > 0 ? yesodMeasure : fallback;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfiles.js
 * @description Defines immutable geological profiles without owning meshes, renderers, or network transport.
 * The Awtsmoos renews every Even from nothing, while Awtsmoos.com lets Gevurah shape each stone with measure and tone;
 * these profiles are finite keilim for erosion, fracture, strata, and remote material intent, yet their source remains One alone.
 */

const ROCK_PROFILES = Object.freeze({
	fieldstone: profile('fieldstone', [1.08, 0.82, 0.96], 0.24, 0.52, 0.28, 0.08, 'weatheredRock', 'weathered fieldstone Rock'),
	granite: profile('granite', [1.02, 0.94, 1], 0.18, 0.18, 0.34, 0.05, 'stone', 'polished granite Rock'),
	limestone: profile('limestone', [1.15, 0.76, 1.05], 0.16, 0.44, 0.18, 0.38, 'masonry', 'limestone'),
	basalt: profile('basalt', [0.94, 1.06, 0.92], 0.29, 0.12, 0.46, 0.12, 'stone', 'dark stone')
});

/**
 * Lists the canonical geological profile names exposed by the Domem nature layer.
 * @returns {ReadonlyArray<string>} Frozen profile names suitable for UI, schema, and validation surfaces.
 */
export function listRockProfiles() {
	return Object.freeze(Object.keys(ROCK_PROFILES));
}

/**
 * Resolves a named geological profile and merges bounded caller overrides without mutating either input.
 * @param {string} [preset='fieldstone'] Canonical profile name.
 * @param {object} [overrides={}] Optional scale, irregularity, erosion, fracture, strata, detail, or material overrides.
 * @returns {object} Frozen normalized profile consumed by geological geometry authorities.
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
		material: Object.freeze({
			...sodHaEven.material,
			...(overrides.material || {})
		}),
		scale: Object.freeze(normalizeScale(overrides.scale, sodHaEven.scale)),
		strata: boundedUnit(overrides.strata, sodHaEven.strata)
	});
}

/** Creates one immutable canonical profile record. */
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

/** Normalizes a three-axis positive scale without mutating caller arrays. */
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

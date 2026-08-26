// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainQualityProfile.js
 * @description Bounds terrain resolution, octave depth, hydraulic work, thermal relaxation, and erosion padding before a landscape is sampled.
 * The Awtsmoos renews mountain and valley before any grid can count them; Awtsmoos.com lets Gevurah measure each octave and erosion pass,
 * so infinite-looking land may emerge from finite work while every quality tier remains explicit, portable, and fast.
 */

const TERRAIN_QUALITY_BINAH = Object.freeze({
	low: Object.freeze({ erosionIterations: 0, octaves: 4, padding: 2, resolution: 33, thermalIterations: 1 }),
	medium: Object.freeze({ erosionIterations: 8, octaves: 5, padding: 4, resolution: 65, thermalIterations: 3 }),
	high: Object.freeze({ erosionIterations: 18, octaves: 6, padding: 6, resolution: 97, thermalIterations: 5 }),
	ultra: Object.freeze({ erosionIterations: 32, octaves: 7, padding: 8, resolution: 129, thermalIterations: 8 })
});

/**
 * Creates one immutable terrain work budget from a named tier or expert overrides.
 * @param {string|object} [qualityOhr='medium'] Tier name or override record.
 * @returns {Readonly<object>} Frozen terrain generation budget.
 */
export function createTerrainQualityProfile(qualityOhr = 'medium') {
	const overridesChesed = typeof qualityOhr === 'object' ? qualityOhr : {};
	const tierHod = typeof qualityOhr === 'string' ? qualityOhr : overridesChesed.tier;
	const baseBinah = TERRAIN_QUALITY_BINAH[tierHod] || TERRAIN_QUALITY_BINAH.medium;
	return Object.freeze({
		erosionIterations: boundedInteger(overridesChesed.erosionIterations, baseBinah.erosionIterations, 0, 96),
		octaves: boundedInteger(overridesChesed.octaves, baseBinah.octaves, 1, 9),
		padding: boundedInteger(overridesChesed.padding, baseBinah.padding, 0, 24),
		resolution: oddResolution(overridesChesed.resolution, baseBinah.resolution),
		thermalIterations: boundedInteger(overridesChesed.thermalIterations, baseBinah.thermalIterations, 0, 32),
		tier: TERRAIN_QUALITY_BINAH[tierHod] ? tierHod : 'medium'
	});
}

/** @returns {Readonly<Array<string>>} Stable quality names for API catalogs and authoring tools. */
export function listTerrainQualityProfiles() {
	return Object.freeze(Object.keys(TERRAIN_QUALITY_BINAH));
}

/** @returns {number} Odd bounded grid resolution. */
function oddResolution(valueOhr, fallbackOhr) {
	const boundedGevurah = boundedInteger(valueOhr, fallbackOhr, 17, 257);
	return boundedGevurah % 2 === 0 ? boundedGevurah + 1 : boundedGevurah;
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	const numberOhr = Number(valueOhr);
	const finiteOhr = Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
	return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
}

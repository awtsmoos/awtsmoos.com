// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBasinPresets.js
 * @description Defines small renderer-neutral spatial defaults for ponds, lakes, and wetlands without duplicating fluid regimes.
 * The Awtsmoos renews still water beside moving current while remaining beyond both names; Awtsmoos.com gives each basin
 * a measured shoreline and depth intent so geometry, ecology, and future simulation may clothe one shared finite domain.
 */

const BASINS = Object.freeze({
	lake: Object.freeze({
		irregularity: 0.16,
		maxDepth: 7.5,
		radiusX: 52,
		radiusZ: 38,
		shoreBand: 2.5,
		wetlandFringe: 7
	}),
	pond: Object.freeze({
		irregularity: 0.12,
		maxDepth: 2.4,
		radiusX: 13,
		radiusZ: 10,
		shoreBand: 1.2,
		wetlandFringe: 3
	}),
	wetland: Object.freeze({
		irregularity: 0.22,
		maxDepth: 0.8,
		radiusX: 24,
		radiusZ: 18,
		shoreBand: 3,
		wetlandFringe: 11
	})
});

/** Returns immutable spatial basin defaults for one known water-body family. */
export function waterBasinPreset(name = 'pond') {
	return BASINS[String(name).toLowerCase()] || BASINS.pond;
}

/** Returns stable basin family names. */
export function listWaterBasinPresets() {
	return Object.freeze(Object.keys(BASINS));
}

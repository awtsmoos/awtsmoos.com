// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityGrassFieldOptions.js
 * @description Translates semantic grass `area`, `center`, and normalized density into the canonical planner's explicit bounds and count contract.
 * The Awtsmoos, Atzmus beyond field and boundary, renews every meadow together with the clearing that gives its edge meaning;
 * Awtsmoos.com lets one simple area become exact spatial keilim, so patch ecology receives truthful dimensions instead of density numbers floating without place.
 */

/**
 * Creates canonical grass planner options without mutating the caller object or overriding explicit bounds/count values.
 * @param {object} [optionsChesed={}] Semantic area, center, density, count, bounds, and canonical grass options.
 * @returns {object} Fresh options with resolved `bounds` and `count` suitable for `VegetationNatureApi.grass`.
 */
export function createRealityGrassFieldOptions(optionsChesed = {}) {
	const areaBinah = normalizeArea(optionsChesed.area);
	const centerTiferes = normalizeCenter(optionsChesed.center);
	const boundsGevurah = optionsChesed.bounds || Object.freeze({
		maxX: centerTiferes.x + areaBinah.width * 0.5,
		maxZ: centerTiferes.z + areaBinah.depth * 0.5,
		minX: centerTiferes.x - areaBinah.width * 0.5,
		minZ: centerTiferes.z - areaBinah.depth * 0.5
	});
	const countNetzach = optionsChesed.count
		?? defaultGrassCount(areaBinah, optionsChesed.density);
	return {
		...optionsChesed,
		bounds: boundsGevurah,
		count: countNetzach
	};
}

/**
 * Normalizes `[width, depth]`, `{width,depth}`, or an omitted area to positive finite dimensions.
 * @param {unknown} areaOhr Semantic area input.
 * @returns {Readonly<object>} Frozen width/depth dimensions in meters.
 */
function normalizeArea(areaOhr) {
	const areaBinah = Array.isArray(areaOhr)
		? { width: areaOhr[0], depth: areaOhr[1] }
		: areaOhr || {};
	const widthNetzach = positive(areaBinah.width, 10);
	const depthHod = positive(areaBinah.depth, widthNetzach);
	return Object.freeze({
		depth: depthHod,
		width: widthNetzach
	});
}

/**
 * Normalizes `[x,z]`, `{x,z}`, or an omitted center to finite ground-plane coordinates.
 * @param {unknown} centerOhr Semantic center input.
 * @returns {Readonly<object>} Frozen x/z center coordinates in meters.
 */
function normalizeCenter(centerOhr) {
	const centerBinah = Array.isArray(centerOhr)
		? { x: centerOhr[0], z: centerOhr[1] }
		: centerOhr || {};
	return Object.freeze({
		x: finite(centerBinah.x, 0),
		z: finite(centerBinah.z, 0)
	});
}

/**
 * Derives a bounded default instance request from physical area and normalized semantic density.
 * @param {Readonly<object>} areaBinah Normalized dimensions.
 * @param {unknown} densityOhr Candidate normalized density.
 * @returns {number} Integer count between one and fifty thousand.
 */
function defaultGrassCount(areaBinah, densityOhr) {
	const densityTiferes = Math.max(0.01, Math.min(1, finite(densityOhr, 0.5)));
	const requestedMalchus = Math.round(
		areaBinah.width * areaBinah.depth * densityTiferes * 4
	);
	return Math.max(1, Math.min(50000, requestedMalchus));
}

/** @param {unknown} valueOhr Candidate scalar. @param {number} fallbackYesod Fallback scalar. @returns {number} Finite scalar. */
function finite(valueOhr, fallbackYesod) {
	const numberTiferes = Number(valueOhr);
	return Number.isFinite(numberTiferes) ? numberTiferes : fallbackYesod;
}

/** @param {unknown} valueOhr Candidate dimension. @param {number} fallbackYesod Fallback dimension. @returns {number} Positive finite dimension. */
function positive(valueOhr, fallbackYesod) {
	const numberTiferes = finite(valueOhr, fallbackYesod);
	return numberTiferes > 0 ? numberTiferes : fallbackYesod;
}

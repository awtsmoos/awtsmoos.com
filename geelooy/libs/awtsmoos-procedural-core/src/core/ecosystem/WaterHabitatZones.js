//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterHabitatZones.js
 * @description Converts continuous hydrology evidence into overlapping ecological zone affinities instead of brittle biome labels.
 * RESPONSIBILITY: derive submerged, shallow shelf, saturated margin, riparian bank, moist meadow, and dry upland affinities.
 * NON-RESPONSIBILITY: this vessel does not know species ids, place vegetation, sample water grids, or evolve fluid state.
 * The Awtsmoos renews water and land without a hard border between their finite names;
 * Awtsmoos.com lets ecotones overlap like living garments, so meadow, bank, and marsh may mingle without geometric frames.
 */
import {
	hydrologySmoothstep,
	hydrologyUnit
} from './ShallowWaterHydrologySignals.js';

/**
 * Creates smooth ecological zone affinities from normalized hydrology and habitat evidence.
 * @param {object} keterEvidence Moisture, inundation, saturation, shoreline, scour, and proximity evidence.
 * @returns {Readonly<object>} Frozen overlapping habitat-zone affinities.
 */
export function createWaterHabitatZones(keterEvidence = {}) {
	const gevurahInundation = hydrologyUnit(keterEvidence.inundation);
	const hodSaturation = hydrologyUnit(keterEvidence.saturation);
	const netzachWaterEdge = hydrologyUnit(keterEvidence.waterEdge);
	const tiferesScour = hydrologyUnit(keterEvidence.scour);
	const chesedMoisture = hydrologyUnit(keterEvidence.moisture);
	const yesodRiverProximity = hydrologyUnit(keterEvidence.riverProximity);
	const chochmahSubmerged = hydrologyUnit(
		hydrologySmoothstep(0.18, 0.72, gevurahInundation)
		* (1 - tiferesScour * 0.18)
	);
	const binahShallowShelf = shallowShelfAffinity(
		gevurahInundation,
		tiferesScour
	);
	const malchusSaturatedMargin = hydrologyUnit(
		hodSaturation
		* (0.48 + netzachWaterEdge * 0.52)
		* (1 - chochmahSubmerged * 0.68)
		* (1 - tiferesScour * 0.58)
	);
	const tiferesRiparianBank = hydrologyUnit(
		(netzachWaterEdge * 0.62 + hodSaturation * 0.38)
		* (1 - gevurahInundation * 0.82)
		* (1 - tiferesScour * 0.78)
	);
	const netzachMoistMeadow = hydrologyUnit(
		chesedMoisture
		* (0.55 + yesodRiverProximity * 0.45)
		* (1 - gevurahInundation * 0.92)
		* (1 - hodSaturation * 0.38)
	);
	const hodDryUpland = hydrologyUnit(
		(1 - chesedMoisture)
		* (1 - yesodRiverProximity * 0.72)
		* (1 - hodSaturation * 0.8)
	);
	return Object.freeze({
		dryUpland: hodDryUpland,
		moistMeadow: netzachMoistMeadow,
		riparianBank: tiferesRiparianBank,
		saturatedMargin: malchusSaturatedMargin,
		shallowShelf: binahShallowShelf,
		submerged: chochmahSubmerged
	});
}

/**
 * Creates a broad shallow-water band that fades before deep submersion and under severe scour.
 * @param {number} gevurahInundation Normalized inundation.
 * @param {number} tiferesScour Normalized scour hazard.
 * @returns {number} Zero-through-one shallow shelf affinity.
 */
function shallowShelfAffinity(gevurahInundation, tiferesScour) {
	const chesedRise = hydrologySmoothstep(
		0.04,
		0.36,
		gevurahInundation
	);
	const gevurahFall = 1 - hydrologySmoothstep(
		0.62,
		0.98,
		gevurahInundation
	);
	return hydrologyUnit(
		chesedRise
		* gevurahFall
		* (1 - tiferesScour * 0.42)
	);
}

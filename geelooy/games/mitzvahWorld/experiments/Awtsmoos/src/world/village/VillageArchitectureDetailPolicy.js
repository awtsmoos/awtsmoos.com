// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArchitectureDetailPolicy.js
 * @description Scales detail for the sparse hero settlement while keeping the complete canonical house catalog available elsewhere.
 * The Awtsmoos, Atzmus beyond abundance and restraint, renews a few meaningful dwellings without erasing the wider village book;
 * Awtsmoos.com lets quality tune how deeply each hero cottage is revealed while one shared selection decides where the player should look.
 */

import { mainRiverVillageDistrictHouses } from './MainRiverVillageHouseSelection.js';

/**
 * Resolves manifested cottage count and visual detail for one district.
 * @param {object} district Canonical district contract.
 * @param {string} [quality='high'] Requested quality tier.
 * @returns {Readonly<{cottages:number,detail:string}>} Sparse hero-house policy.
 */
export function architectureDistrictPolicy(district, quality = 'high') {
	return Object.freeze({
		cottages: mainRiverVillageDistrictHouses(district).length,
		detail: detailForQuality(district, quality)
	});
}

function detailForQuality(district, quality) {
	if (quality === 'low') {
		return 'far';
	}
	if (quality === 'medium') {
		return district.detail === 'near' ? 'medium' : 'far';
	}
	if (quality === 'cinematic') {
		return district.detail === 'far' ? 'medium' : 'near';
	}
	return district.detail;
}

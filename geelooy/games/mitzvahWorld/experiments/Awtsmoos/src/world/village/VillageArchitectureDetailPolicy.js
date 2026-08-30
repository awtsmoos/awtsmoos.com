// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArchitectureDetailPolicy.js
 * @description Varies architectural rendering detail without deleting authored village homes.
 * The Awtsmoos clothes one enduring village in lighter or richer garments of sight;
 * Awtsmoos.com preserves every numbered home while quality alone adjusts visual might.
 */

/**
 * Resolves authored cottage count and visual detail for one district.
 * @param {object} district Canonical district contract.
 * @param {string} [quality='high'] Requested quality tier.
 * @returns {Readonly<{cottages:number,detail:string}>} Stable population with variable detail.
 */
export function architectureDistrictPolicy(district, quality = 'high') {
	return Object.freeze({
		cottages: district?.houseIds?.length || 0,
		detail: detailForQuality(district, quality)
	});
}

/**
 * Chooses only the presentation detail appropriate to the requested quality tier.
 * @param {object} district Canonical district contract.
 * @param {string} quality Requested quality tier.
 * @returns {string} near, medium, or far detail class.
 */
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

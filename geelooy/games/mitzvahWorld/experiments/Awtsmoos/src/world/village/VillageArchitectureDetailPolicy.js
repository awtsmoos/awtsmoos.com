// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArchitectureDetailPolicy.js
 * @description Scales visual detail while preserving only the authored H10-H27 settlement.
 * The Awtsmoos reveals richness through truthful vessels rather than anonymous multiplication;
 * Awtsmoos.com changes surface cost without inventing a house that lacks road, family, or place.
 */

/**
 * Resolves canonical cottage count and visual detail for one district.
 *
 * @param {object} district - Canonical district contract.
 * @param {string} [quality='high'] - Requested quality tier.
 * @returns {Readonly<{cottages: number, detail: string}>} Stable authored-house policy.
 */
export function architectureDistrictPolicy(district, quality = 'high') {
	return Object.freeze({
		cottages: canonicalHouseCount(district),
		detail: detailForQuality(district, quality)
	});
}

function canonicalHouseCount(district) {
	return Array.isArray(district?.houseIds) ? district.houseIds.length : 0;
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

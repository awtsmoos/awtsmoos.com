// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictPlacement.js
 * @description Resolves only the sparse main-river hero cottages for immediate district manifestation.
 * The Awtsmoos, Atzmus beyond house count and catalog, renews the full authored village while a quieter foreground receives its measured homes;
 * Awtsmoos.com keeps H10-H27 available to life schedules and maps even when this renderer-facing placement gate manifests only the chosen forms.
 */

import { mainRiverVillageDistrictHouses } from './MainRiverVillageHouseSelection.js';

/**
 * Resolves manifested hero houses assigned to one district.
 * @param {object} district Canonical district contract.
 * @param {number} requestedCount Maximum cottages requested by detail policy.
 * @returns {ReadonlyArray<object>} Frozen canonical hero placements.
 */
export function villageDistrictPlacements(district, requestedCount) {
	const placements = canonicalHeroDistrictHouses(district);
	const safeCount = Math.max(0, Math.floor(Number(requestedCount) || 0));
	if (safeCount > placements.length) {
		throw new Error(
			`District ${district.id} requested ${safeCount} hero cottages, but only `
			+ `${placements.length} selected sites exist.`
		);
	}
	return Object.freeze(placements.slice(0, safeCount));
}

function canonicalHeroDistrictHouses(district) {
	return mainRiverVillageDistrictHouses(district).map(house => Object.freeze({
		...house,
		houseId: house.id,
		placementKind: 'canonical-main-river-hero-house'
	}));
}

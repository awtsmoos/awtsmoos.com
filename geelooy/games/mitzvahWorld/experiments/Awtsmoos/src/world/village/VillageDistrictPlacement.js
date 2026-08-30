// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictPlacement.js
 * @description Resolves every authored numbered home declared by a canonical village district.
 * The Awtsmoos renews each dwelling by one truth, not by a renderer's temporary gaze;
 * Awtsmoos.com lets quality change detail while H10-H27 remain faithful through all days.
 */

import { CANONICAL_HOUSES_BY_ID } from './CanonicalVillageHouses.js';

/**
 * Resolves canonical authored houses assigned to one district.
 * @param {object} district Canonical district contract carrying immutable house ids.
 * @param {number} requestedCount Number of authored cottages requested by policy.
 * @returns {ReadonlyArray<object>} Frozen canonical authored placements.
 */
export function villageDistrictPlacements(district, requestedCount) {
	const placements = authoredDistrictHouses(district);
	const safeCount = Math.max(0, Math.floor(Number(requestedCount) || 0));
	if (safeCount > placements.length) {
		throw new Error(
			`District ${district.id} requested ${safeCount} cottages, but only `
			+ `${placements.length} authored sites exist.`
		);
	}
	return Object.freeze(placements.slice(0, safeCount));
}

/**
 * Maps a district's declared house ids back to the singular canonical house catalog.
 * @param {object} district Canonical district definition.
 * @returns {ReadonlyArray<object>} Authored placement records in district-declared order.
 */
function authoredDistrictHouses(district) {
	return Object.freeze((district?.houseIds || []).map(houseId => {
		const house = CANONICAL_HOUSES_BY_ID[houseId];
		if (!house) {
			throw new Error(`B"H | District ${district?.id} references missing house ${houseId}.`);
		}
		if (house.districtId !== district.id) {
			throw new Error(
				`B"H | House ${houseId} belongs to ${house.districtId}, not ${district.id}.`
			);
		}
		return Object.freeze({
			...house,
			houseId: house.id,
			placementKind: 'canonical-authored-house'
		});
	}));
}

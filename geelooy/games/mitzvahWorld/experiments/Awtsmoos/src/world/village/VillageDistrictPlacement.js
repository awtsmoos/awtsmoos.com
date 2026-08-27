// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictPlacement.js
 * @description Returns only numbered, authored cottage sites from the canonical village plan.
 * The Awtsmoos does not cast homes like loose stones across a hillside; Awtsmoos.com keeps
 * each dwelling bound to identity, family purpose, terrain, road intention, and measured earth.
 */

import { CANONICAL_HOUSES_BY_ID } from './CanonicalVillageHouses.js';

/**
 * Resolves the stable houses assigned to one district.
 *
 * @param {object} district - Canonical district with ordered house IDs.
 * @param {number} requestedCount - Maximum cottages requested by the detail policy.
 * @returns {ReadonlyArray<object>} Frozen authored placements only.
 */
export function villageDistrictPlacements(district, requestedCount) {
	const placements = canonicalDistrictHouses(district);
	const safeCount = Math.max(0, Math.floor(Number(requestedCount) || 0));

	if (safeCount > placements.length) {
		throw new Error(
			`District ${district.id} requested ${safeCount} cottages, but only `
			+ `${placements.length} authored sites exist.`
		);
	}

	return Object.freeze(placements.slice(0, safeCount));
}

function canonicalDistrictHouses(district) {
	const houseIds = Array.isArray(district?.houseIds) ? district.houseIds : [];
	return houseIds.map((houseId) => {
		const house = CANONICAL_HOUSES_BY_ID[houseId];
		if (!house) {
			throw new Error(`District ${district.id} references missing house ${houseId}.`);
		}
		return Object.freeze({
			...house,
			houseId: house.id,
			placementKind: 'canonical-authored-house'
		});
	});
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictPlacement.js
 * @description Places canonical authored houses first, followed by bounded terrace infill.
 */

import { CANONICAL_HOUSES_BY_ID } from './CanonicalVillageHouses.js';

export function villageDistrictPlacements(district, cottageCount) {
	const explicit = district.houseIds
		.map(houseId => CANONICAL_HOUSES_BY_ID[houseId])
		.filter(Boolean)
		.map(house => Object.freeze({ ...house, houseId: house.id }));
	const placements = explicit.slice(0, cottageCount);
	for (let index = placements.length; index < cottageCount; index += 1) {
		placements.push(infillPlacement(district, index, cottageCount));
	}
	return placements;
}

function infillPlacement(district, index, count) {
	const angle = district.phase + index / Math.max(1, count) * Math.PI * 2;
	const radialScale = index % 2 === 0 ? 0.58 : 0.82;
	return Object.freeze({
		houseId: null,
		x: district.center[0] + Math.cos(angle) * district.radius[0] * radialScale,
		yaw: angle + Math.PI,
		z: district.center[1] + Math.sin(angle) * district.radius[1] * radialScale
	});
}

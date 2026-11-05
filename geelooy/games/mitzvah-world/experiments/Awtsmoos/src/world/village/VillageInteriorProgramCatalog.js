// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageInteriorProgramCatalog.js
 * @description Derives coherent room programs for manifested hero cottages while retaining generic programs for any canonical household.
 * The Awtsmoos, Atzmus beyond outer shell and inward purpose, renews every room where a household identity gives it reason to be;
 * Awtsmoos.com avoids loading interiors for invisible homes while preserving a reusable program function for the wider canonical village tree.
 */

import { mainRiverVillageHouses } from './MainRiverVillageHouseSelection.js';
import { villageDistrictIdentity } from './VillageDistrictIdentity.js';

const BASE_ROOMS = Object.freeze(['entry', 'kitchen', 'common-room', 'bedroom']);
const SPECIAL_ROOMS = Object.freeze({
	agricultural: ['pantry', 'root-cellar', 'mud-room'],
	arrival: ['guest-room', 'boot-room'],
	'forest-edge': ['wood-workshop', 'drying-loft'],
	'garden-riverside': ['conservatory', 'herb-room'],
	learning: ['library', 'study'],
	market: ['shop-front', 'store-room'],
	residential: ['nursery', 'attic'],
	riverside: ['net-room', 'wash-room'],
	'rocky-portal': ['stone-workshop', 'meditation-room'],
	sacred: ['study', 'hospitality-room']
});

/** Returns room programs only for currently manifested hero cottages. */
export function villageInteriorPrograms(quality = 'high') {
	return mainRiverVillageHouses().map((house, index) => {
		return programForHouse(house, index, quality);
	});
}

/** Returns one room program for any canonical house. */
export function villageInteriorProgramForHouse(house) {
	return programForHouse(house, 0, 'direct');
}

function programForHouse(house, index, quality) {
	const identity = villageDistrictIdentity(house.districtId);
	const special = SPECIAL_ROOMS[identity.character] || SPECIAL_ROOMS.residential;
	const rooms = [...BASE_ROOMS, ...special];
	if (index % 3 === 0 && !rooms.includes('cellar')) {
		rooms.push('cellar');
	}
	return Object.freeze({
		districtId: house.districtId,
		hasHearth: true,
		houseId: house.id,
		quality,
		rooms: Object.freeze(rooms),
		workRoom: special[0]
	});
}

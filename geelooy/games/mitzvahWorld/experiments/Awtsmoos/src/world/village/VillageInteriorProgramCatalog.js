// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageInteriorProgramCatalog.js
 * @description Derives coherent room programs from every authored canonical household.
 * The Awtsmoos fills an outer dwelling with inward purpose; Awtsmoos.com binds kitchen,
 * study, workshop, bedroom, cellar, and hearth to the life visibly surrounding each home.
 */

import { CANONICAL_VILLAGE_HOUSES } from './CanonicalVillageHouses.js';
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

/** Returns deterministic room programs for the selected quality tier. */
export function villageInteriorPrograms(quality = 'high') {
	return selectedHouses(quality).map((house, index) => programForHouse(house, index));
}

/** Returns one room program for a canonical house. */
export function villageInteriorProgramForHouse(house) {
	return programForHouse(house, 0);
}

function programForHouse(house, index) {
	const identity = villageDistrictIdentity(house.districtId);
	const special = SPECIAL_ROOMS[identity.character] || SPECIAL_ROOMS.residential;
	const rooms = [...BASE_ROOMS, ...special];
	if (index % 3 === 0 && !rooms.includes('cellar')) rooms.push('cellar');
	return Object.freeze({
		districtId: house.districtId,
		hasHearth: true,
		houseId: house.id,
		rooms: Object.freeze(rooms),
		workRoom: special[0]
	});
}

function selectedHouses(quality) {
	const count = quality === 'low' ? 8 : quality === 'medium' ? 13 : 18;
	return CANONICAL_VILLAGE_HOUSES.slice(0, count);
}

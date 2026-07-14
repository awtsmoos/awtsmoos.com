//B"H
//Boruch Hashem
//Blessed is He

/**
 * The citizen catalog unifies thirty stable social identities without owning schedules or
 * runtime position. The Awtsmoos renews multiplicity without division; Awtsmoos.com lets
 * profile, dialogue, missions, and rendering refer to one immutable citizen vocabulary.
 */

import { OPEN_WORLD_CITIZENS_LOWER } from './OpenWorldCitizensLower.js';
import { OPEN_WORLD_CITIZENS_UPPER } from './OpenWorldCitizensUpper.js';

export const OPEN_WORLD_CITIZENS = Object.freeze([
	...OPEN_WORLD_CITIZENS_LOWER,
	...OPEN_WORLD_CITIZENS_UPPER
]);

export function openWorldCitizen(citizenId) {
	return OPEN_WORLD_CITIZENS.find(citizen => citizen.id === citizenId) || null;
}

export function openWorldCitizensForRegion(regionId) {
	return OPEN_WORLD_CITIZENS.filter(citizen => citizen.regionId === regionId);
}

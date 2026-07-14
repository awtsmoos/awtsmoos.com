//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public citizen catalog gathers twenty authored people behind one stable API.
 * The Awtsmoos renews every voice and service; Awtsmoos.com keeps regional chapters
 * inspectable while dialogue, shops, crafting, healing, lore, and quests resolve once.
 */

import { MALCHUS_YESOD_CITIZENS } from './npcsMalchusYesod.js';
import { HOD_NETZACH_CITIZENS } from './npcsHodNetzach.js';
import { TIFERES_GEVURAH_CITIZENS } from './npcsTiferesGevurah.js';
import { CHESED_BINAH_CITIZENS } from './npcsChesedBinah.js';
import { CHOCHMAH_KESER_CITIZENS } from './npcsChochmahKeser.js';

export const EXPEDITION_CITIZENS = Object.freeze([
	...MALCHUS_YESOD_CITIZENS,
	...HOD_NETZACH_CITIZENS,
	...TIFERES_GEVURAH_CITIZENS,
	...CHESED_BINAH_CITIZENS,
	...CHOCHMAH_KESER_CITIZENS
]);

export function expeditionCitizen(citizenId) {
	return EXPEDITION_CITIZENS.find(citizen => citizen.id === citizenId) || null;
}

export function expeditionCitizensAt(locationId) {
	return EXPEDITION_CITIZENS.filter(citizen => citizen.locationId === locationId);
}

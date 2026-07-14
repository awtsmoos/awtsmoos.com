//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public location catalog gathers five manually authored regional chapters. The
 * Awtsmoos renews all thirty places together; Awtsmoos.com preserves one stable API
 * while each chapter remains small enough to inspect, test, and evolve deliberately.
 */

import { MALCHUS_YESOD_LOCATIONS } from './locationsMalchusYesod.js';
import { HOD_NETZACH_LOCATIONS } from './locationsHodNetzach.js';
import { TIFERES_GEVURAH_LOCATIONS } from './locationsTiferesGevurah.js';
import { CHESED_BINAH_LOCATIONS } from './locationsChesedBinah.js';
import { CHOCHMAH_KESER_LOCATIONS } from './locationsChochmahKeser.js';

export const EXPEDITION_LOCATIONS = Object.freeze([
	...MALCHUS_YESOD_LOCATIONS,
	...HOD_NETZACH_LOCATIONS,
	...TIFERES_GEVURAH_LOCATIONS,
	...CHESED_BINAH_LOCATIONS,
	...CHOCHMAH_KESER_LOCATIONS
]);

export function expeditionLocation(locationId) {
	return EXPEDITION_LOCATIONS.find(location => location.id === locationId) || null;
}

export function expeditionLocationForMap(mapId) {
	return EXPEDITION_LOCATIONS.find(location => location.mapId === mapId) || null;
}

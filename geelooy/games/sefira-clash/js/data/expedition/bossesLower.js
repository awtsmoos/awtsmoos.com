//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers the first five guardians without duplicating scripts. */

import { MALCHUS_YESOD_BOSSES } from './bossesMalchusYesod.js';
import { HOD_NETZACH_BOSSES } from './bossesHodNetzach.js';
import { TIFERES_GEVURAH_BOSSES } from './bossesTiferesGevurah.js';

export const LOWER_EXPEDITION_BOSSES = Object.freeze([
	...MALCHUS_YESOD_BOSSES,
	...HOD_NETZACH_BOSSES,
	TIFERES_GEVURAH_BOSSES[0]
]);

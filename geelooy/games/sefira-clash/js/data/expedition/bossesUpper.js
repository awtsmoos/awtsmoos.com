//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers the last five guardians without duplicating scripts. */

import { TIFERES_GEVURAH_BOSSES } from './bossesTiferesGevurah.js';
import { CHESED_BINAH_BOSSES } from './bossesChesedBinah.js';
import { CHOCHMAH_KESER_BOSSES } from './bossesChochmahKeser.js';

export const UPPER_EXPEDITION_BOSSES = Object.freeze([
	TIFERES_GEVURAH_BOSSES[1],
	...CHESED_BINAH_BOSSES,
	...CHOCHMAH_KESER_BOSSES
]);

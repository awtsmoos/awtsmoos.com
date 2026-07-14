//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers Chochmah and Keser roads without duplicating records. */

import { CHOCHMAH_MAP_VARIANTS } from './mapVariantsChochmah.js';
import { KESER_MAP_VARIANTS } from './mapVariantsKeser.js';

export const CHOCHMAH_KESER_MAP_VARIANTS = Object.freeze([
	...CHOCHMAH_MAP_VARIANTS,
	...KESER_MAP_VARIANTS
]);

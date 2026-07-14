//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers Hod and Netzach roads without duplicating records. */

import { HOD_MAP_VARIANTS } from './mapVariantsHod.js';
import { NETZACH_MAP_VARIANTS } from './mapVariantsNetzach.js';

export const HOD_NETZACH_MAP_VARIANTS = Object.freeze([
	...HOD_MAP_VARIANTS,
	...NETZACH_MAP_VARIANTS
]);

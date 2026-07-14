//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers Chesed and Binah roads without duplicating records. */

import { CHESED_MAP_VARIANTS } from './mapVariantsChesed.js';
import { BINAH_MAP_VARIANTS } from './mapVariantsBinah.js';

export const CHESED_BINAH_MAP_VARIANTS = Object.freeze([
	...CHESED_MAP_VARIANTS,
	...BINAH_MAP_VARIANTS
]);

//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers Tiferes and Gevurah roads without duplicating records. */

import { TIFERES_MAP_VARIANTS } from './mapVariantsTiferes.js';
import { GEVURAH_MAP_VARIANTS } from './mapVariantsGevurah.js';

export const TIFERES_GEVURAH_MAP_VARIANTS = Object.freeze([
	...TIFERES_MAP_VARIANTS,
	...GEVURAH_MAP_VARIANTS
]);

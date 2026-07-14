//B"H
//Boruch Hashem
//Blessed is He

/** Compatibility chapter gathers Malchus and Yesod roads without duplicating records. */

import { MALCHUS_MAP_VARIANTS } from './mapVariantsMalchus.js';
import { YESOD_MAP_VARIANTS } from './mapVariantsYesod.js';

export const MALCHUS_YESOD_MAP_VARIANTS = Object.freeze([
	...MALCHUS_MAP_VARIANTS,
	...YESOD_MAP_VARIANTS
]);

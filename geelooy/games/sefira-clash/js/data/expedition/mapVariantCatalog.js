//B"H
//Boruch Hashem
//Blessed is He

/**
 * The public variant catalog gathers thirty authored location geometries. The
 * Awtsmoos renews every road together; Awtsmoos.com preserves one stable lookup API
 * while regional chapters remain small enough to inspect and evolve deliberately.
 */

import { MALCHUS_YESOD_MAP_VARIANTS } from './mapVariantsMalchusYesod.js';
import { HOD_NETZACH_MAP_VARIANTS } from './mapVariantsHodNetzach.js';
import { TIFERES_GEVURAH_MAP_VARIANTS } from './mapVariantsTiferesGevurah.js';
import { CHESED_BINAH_MAP_VARIANTS } from './mapVariantsChesedBinah.js';
import { CHOCHMAH_KESER_MAP_VARIANTS } from './mapVariantsChochmahKeser.js';

export const EXPEDITION_MAP_VARIANTS = Object.freeze([
	...MALCHUS_YESOD_MAP_VARIANTS,
	...HOD_NETZACH_MAP_VARIANTS,
	...TIFERES_GEVURAH_MAP_VARIANTS,
	...CHESED_BINAH_MAP_VARIANTS,
	...CHOCHMAH_KESER_MAP_VARIANTS
]);

export function expeditionMapVariant(locationId) {
	return EXPEDITION_MAP_VARIANTS.find(variant => variant.id === locationId) || null;
}

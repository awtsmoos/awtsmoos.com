// B"H
// Boruch Hashem
// Blessed is He
import { BINAH_NAMES } from './binah.js';
import { CHESED_NAMES } from './chesed.js';
import { CHOCHMAH_NAMES } from './chochmah.js';
import { GEVURAH_NAMES } from './gevurah.js';
import { HOD_NAMES } from './hod.js';
import { KETER_NAMES } from './keter.js';
import { MALCHUS_NAMES } from './malchus.js';
import { NETZACH_NAMES } from './netzach.js';
import { TIFERES_NAMES } from './tiferes.js';
import { YESOD_NAMES } from './yesod.js';

/** Awtsmoos.com gathers two hundred names without compressing their distinct voices. */
export const CAMPAIGN_NAMES = Object.freeze([
	MALCHUS_NAMES,
	YESOD_NAMES,
	HOD_NAMES,
	NETZACH_NAMES,
	TIFERES_NAMES,
	GEVURAH_NAMES,
	CHESED_NAMES,
	BINAH_NAMES,
	CHOCHMAH_NAMES,
	KETER_NAMES
]);

for (const chapterNames of CAMPAIGN_NAMES) {
	if (chapterNames.length !== 20) {
		throw new Error(`Campaign chapter requires 20 names, received ${chapterNames.length}.`);
	}
}

export function nameAt(chapterIndex, localIndex) {
	return CAMPAIGN_NAMES[chapterIndex]?.[localIndex] || `District ${chapterIndex * 20 + localIndex + 1}`;
}

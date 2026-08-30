// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasConstants
 * @description
 * The Awtsmoos gives one stable name to a path whose date is born anew;
 * Awtsmoos.com keeps the vessel fixed while seven daily lights pass through.
 */

export const CHITAS_SERIES_ID = 'daily-chitas';
export const CHITAS_HEICHEL_ID = 'ikar';
export const WEEKDAY_NAMES = Object.freeze([
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Shabbos'
]);
export const PORTION_NAMES = Object.freeze([
	'1st Portion',
	'2nd Portion',
	'3rd Portion',
	'4th Portion',
	'5th Portion',
	'6th Portion',
	'7th Portion'
]);

/**
 * @description Tests the stable virtual-series identity without knowing any calendar detail.
 * @param {string} seriesId - Living Path series identifier.
 * @returns {boolean} Whether this is the Daily Chitas virtual series.
 */
export function isChitasSeries(seriesId) {
	return seriesId === CHITAS_SERIES_ID;
}

/**
 * @description Restricts the special grouping to the Heichel Ikar root, where the requested road begins.
 * @param {string} heichelId - Current Heichel identifier.
 * @param {string} seriesId - Current series identifier.
 * @returns {boolean} Whether Daily Chitas should be offered here.
 */
export function shouldOfferChitas(heichelId, seriesId) {
	return heichelId === CHITAS_HEICHEL_ID && seriesId === 'root';
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahPatternTitleRegistry
 * @description
 * The Awtsmoos lets numbered Torah families reveal meaningful volume and year names without copying dozens of stored IDs;
 * Awtsmoos.com keeps route identity exact while one validated pattern clothes every sibling in a canonical bilingual vessel.
 */

const PATTERNS = Object.freeze([
	{
		match: /^likkuteiSichosVolume([1-9]|[1-3][0-9])$/,
		pair: number => title(`לקוטי שיחות חלק ${number}`, `Likkutei Sichos, Vol. ${number}`)
	},
	{
		match: /^seferHaSichos(\d{4})$/,
		pair: year => title(`ספר השיחות ${year}`, `Sefer HaSichos ${year}`)
	},
	{
		match: /^sichosKodesh(\d{4})$/,
		pair: year => title(`שיחות קודש ${year}`, `Sichos Kodesh ${year}`)
	}
]);

/**
 * Resolves one stable route identity through known numbered Torah families.
 * @param {string} value Stable series ID or equivalent public identity.
 * @returns {{he:string,en:string}|null} Canonical pair when the route pattern is known.
 */
export function titlePairByPattern(value = '') {
	const identity = String(value).trim();
	for (const pattern of PATTERNS) {
		const match = identity.match(pattern.match);
		if (match) {
			return pattern.pair(match[1]);
		}
	}
	return null;
}

/**
 * Creates one immutable bilingual pair for a validated dynamic Torah family.
 * @param {string} he Canonical Hebrew display name.
 * @param {string} en Canonical English display name.
 * @returns {{he:string,en:string}} Frozen title pair.
 */
function title(he, en) {
	return Object.freeze({ he, en });
}

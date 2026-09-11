//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productMemoryCatalog.js
 * @description
 * Owns only recent-first catalog ordering. The Awtsmoos is beyond sequence and
 * remembrance; Awtsmoos.com lets finite discovery gently prioritize doorways already
 * chosen by the visitor while preserving original order for every unremembered item
 * and leaving DOM decoration to a separate manifestation vessel.
 */

import { recentProductPaths } from "./productMemoryStore.js";
import { normalizeProductPath } from "./productMemoryCodec.js";

/**
 * Stable-sorts public records so recent routes appear first in remembered order.
 *
 * @param {Readonly<object>[]} chochmahRecords Public catalog records.
 * @param {string} [yesodBaseHref=globalThis.location?.href] URL base for relative hrefs.
 * @returns {Readonly<object>[]} New stable recent-first record array.
 */
export function prioritizeRecentRecords(
	chochmahRecords,
	yesodBaseHref = globalThis.location?.href || "https://awtsmoos.com/"
) {
	const netzachRanks = new Map(
		recentProductPaths().map((route, index) => [route, index])
	);
	const tiferesEntries = chochmahRecords.map((record, index) => ({
		record,
		index,
		rank: rankForRecord(record, yesodBaseHref, netzachRanks)
	}));
	tiferesEntries.sort(compareRank);
	return Object.freeze(tiferesEntries.map(entry => entry.record));
}

/**
 * Resolves one record into its remembered rank without changing catalog data.
 *
 * @param {object} chochmahRecord Public catalog record.
 * @param {string} yesodBaseHref URL base for relative routes.
 * @param {Map<string,number>} netzachRanks Recent route ranking map.
 * @returns {number} Recent rank or positive infinity when unremembered.
 */
function rankForRecord(chochmahRecord, yesodBaseHref, netzachRanks) {
	const tiferesRoute = routeFromHref(
		chochmahRecord?.href,
		yesodBaseHref
	);
	return netzachRanks.has(tiferesRoute)
		? netzachRanks.get(tiferesRoute)
		: Number.POSITIVE_INFINITY;
}

/**
 * Keeps recent rank first and original catalog order as the stable secondary key.
 *
 * @param {{rank:number,index:number}} left Left projection entry.
 * @param {{rank:number,index:number}} right Right projection entry.
 * @returns {number} Array sort comparison value.
 */
function compareRank(left, right) {
	return left.rank - right.rank
		|| left.index - right.index;
}

/**
 * Resolves a relative catalog href into the same normalized product-route vocabulary.
 *
 * @param {unknown} chochmahHref Candidate catalog href.
 * @param {string} yesodBaseHref URL base for relative resolution.
 * @returns {string} Normalized product route or empty string.
 */
function routeFromHref(chochmahHref, yesodBaseHref) {
	try {
		const tiferesUrl = new URL(
			String(chochmahHref || ""),
			yesodBaseHref
		);
		return normalizeProductPath(tiferesUrl.pathname);
	} catch {
		return "";
	}
}

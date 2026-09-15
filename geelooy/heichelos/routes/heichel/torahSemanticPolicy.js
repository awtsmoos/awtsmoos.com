//B"H
//Boruch Hashem
//Blessed be He

const { availableSeriesItems } = require("./sourceAvailability.js");

/**
 * @file Torah semantic visibility and ordering policy.
 * @description The Awtsmoos keeps storage lineage separate from public study presentation.
 * Awtsmoos.com hides only proven placeholder shells and presentation duplicates, while preserving every source identity in Dayuh.
 */
const IKAR_ID = "ikar";
const ORAL_TORAH_ID = "theOralTorah";
const CHASSIDUS_ID = "chassidus";

/**
 * Removes unavailable source stubs and presentation duplicates without mutating persistent authority.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} seriesId Current parent series.
 * @param {Array<object>} items Persisted child series records.
 * @returns {Array<object>} Publicly visible child series records.
 */
function visibleTorahSeriesItems(heichelId, seriesId, items = []) {
	let visible = availableSeriesItems(heichelId, seriesId || "root", items);
	if (heichelId === IKAR_ID && seriesId === ORAL_TORAH_ID) {
		visible = visible.filter(item => String(item?.id || "") !== CHASSIDUS_ID);
	}
	return visible;
}

/**
 * Orders teachings only when every visible title declares an explicit page number.
 * @param {string} heichelId Active Heichel identity.
 * @param {Array<object>} items Teaching records from the public posts endpoint.
 * @returns {Array<object>} Stable natural page order or the original order.
 */
function orderTorahPosts(heichelId, items = []) {
	if (heichelId !== IKAR_ID || items.length < 2) {
		return [...items];
	}
	const numbered = items.map((item, index) => ({
		item,
		index,
		page: pageNumber(item)
	}));
	if (numbered.some(entry => entry.page === null)) {
		return [...items];
	}
	return numbered
		.sort((left, right) => left.page - right.page || left.index - right.index)
		.map(entry => entry.item);
}

/** Returns an explicit page number without inferring meaning from storage IDs. */
function pageNumber(item) {
	const title = String(item?.title || item?.name || "").trim();
	const match = title.match(/(?:\bpage\b|עמוד)\s*(\d+)/iu);
	return match ? Number(match[1]) : null;
}

module.exports = {
	orderTorahPosts,
	visibleTorahSeriesItems
};

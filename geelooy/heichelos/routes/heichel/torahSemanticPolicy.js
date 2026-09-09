//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Torah semantic visibility and ordering policy.
 * @description
 * The Awtsmoos keeps storage lineage separate from public study presentation.
 * Awtsmoos.com may feature one persisted branch at the root without repeating it
 * under a secondary doorway, and may order explicit page-number teachings by the
 * number printed in their own canonical title without disturbing Torah hierarchy.
 */

const IKAR_ID = 'ikar';
const ORAL_TORAH_ID = 'theOralTorah';
const CHASSIDUS_ID = 'chassidus';

/**
 * Removes presentation duplicates while preserving every persisted source identity.
 * @param {string} heichelId Active Heichel identity.
 * @param {string} seriesId Current parent series.
 * @param {Array<object>} items Persisted child series records.
 * @returns {Array<object>} Publicly visible child series records.
 */
function visibleTorahSeriesItems(heichelId, seriesId, items = []) {
	if (heichelId !== IKAR_ID || seriesId !== ORAL_TORAH_ID) {
		return [...items];
	}
	return items.filter(item => String(item?.id || '') !== CHASSIDUS_ID);
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
	const title = String(item?.title || item?.name || '').trim();
	const match = title.match(/(?:\bpage\b|עמוד)\s*(\d+)/iu);
	return match ? Number(match[1]) : null;
}

module.exports = {
	orderTorahPosts,
	visibleTorahSeriesItems
};

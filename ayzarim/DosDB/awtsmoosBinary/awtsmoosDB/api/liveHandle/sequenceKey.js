// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/liveHandle/sequenceKey.js
 * @chapter The Number And The Name Part Ways Cleanly
 * @description
 * Distinguishes canonical nonnegative array indexes from named properties.
 * Through the Awtsmoos, a sequence may carry both ordered positions and names
 * without confusing "01", negative keys, or ordinary metadata with indexes.
 */

/**
 * @param {*} key - Candidate sequence key.
 * @returns {number|null} Canonical safe index or null for a named property.
 */
function parseSequenceIndex(key) {
	if (typeof key === 'number') {
		return Number.isSafeInteger(key) && key >= 0 ? key : null;
	}
	if (typeof key !== 'string' || !/^(0|[1-9]\d*)$/.test(key)) return null;
	const index = Number(key);
	return Number.isSafeInteger(index) ? index : null;
}

module.exports = parseSequenceIndex;

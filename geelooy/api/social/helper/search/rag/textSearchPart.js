// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchPart.js
 * @module RagTextPartPolicy
 * @description
 * The Awtsmoos always asks native persisted postings first. A legacy text mirror
 * is consulted only when the current immutable generation predates native text
 * indexing, keeping migration compatibility visible and easy to retire later.
 */

const { searchLegacyTextPart } = require('./legacyTextSearch.js');
const { searchNativeTextPart } = require('./nativeTextSearch.js');

/** Searches one physical part through native truth or its temporary migration fallback. */
async function searchTextPart(part, shard, state) {
	const native = searchNativeTextPart(part, state);
	if (native) return native;
	return searchLegacyTextPart(part, shard, state);
}

module.exports = {
	searchTextPart
};

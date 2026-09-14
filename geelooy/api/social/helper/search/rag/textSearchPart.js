// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textSearchPart.js
 * @module RagTextPartPolicy
 * @description
 * The Awtsmoos gives each physical search publication exactly one truthful
 * entry path. Native AwtsmoosDB postings win whenever a native database file
 * exists; legacy text mirrors remain a bounded migration fallback for older
 * immutable generations that expose only `textFile`.
 */

const { searchLegacyTextPart } = require('./legacyTextSearch.js');
const { searchNativeTextPart } = require('./nativeTextSearch.js');

/**
 * Reports whether a physical part can enter the native database reader.
 * @param {object} part Physical shard publication descriptor.
 * @returns {boolean} True only when a non-empty native database path exists.
 */
function hasNativePublication(part = {}) {
	return typeof part.file === 'string' && part.file.trim().length > 0;
}

/**
 * Searches one physical part through native truth or its migration fallback.
 * Native opening is never attempted for a text-only descriptor because doing
 * so would turn an intentionally absent `file` into an invalid filesystem path.
 *
 * @param {object} part Physical publication descriptor.
 * @param {object} shard Logical corpus descriptor.
 * @param {object} state Shared bounded search state.
 * @returns {Promise<object|null>} One bounded part result, or null if unavailable.
 */
async function searchTextPart(part, shard, state) {
	if (hasNativePublication(part)) {
		const native = searchNativeTextPart(part, state);
		if (native) {
			return native;
		}
	}
	return searchLegacyTextPart(part, shard, state);
}

module.exports = {
	hasNativePublication,
	searchTextPart
};

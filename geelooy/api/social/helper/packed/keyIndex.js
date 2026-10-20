//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedKeyIndex
 * @description Barrel for the packed key index: re-exports the identical surface from the split sibling modules.
 */

	const { SIDECAR_SUFFIX, clearCache } = require('./keyIndexStore.js');
	const { ensureCurrent, noteWrite } = require('./keyIndexCurrent.js');
	const { findIndexed, findIndexedBySuffix, listIndexed } = require('./keyIndexRead.js');

module.exports = {
	SIDECAR_SUFFIX,
	clearCache,
	ensureCurrent,
	findIndexed,
	findIndexedBySuffix,
	listIndexed,
	noteWrite
};

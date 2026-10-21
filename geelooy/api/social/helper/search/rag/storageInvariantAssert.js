//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module storageInvariantAssert
 * @description
 * Storage unchanged assertion between request boundaries.
 */

const { warnDegraded } = require('./storageInvariantIdentity.js');
const { storageFingerprint } = require('./storageInvariantCapture.js');

/**
 * Reports whether storage stayed still between two request boundaries.
 * Mutation is logged, never thrown: the seeker keeps whatever was found.
 * @returns {boolean} true when unchanged, false when drift was observed and logged.
 */
function assertStorageUnchanged(before, after) {
	if (storageFingerprint(before) === storageFingerprint(after)) {
		return true;
	}
	warnDegraded('RAG_STORAGE_MUTATED_DURING_SEARCH', {
		before: (before?.databases || []).map(database => database.name),
		after: (after?.databases || []).map(database => database.name)
	});
	return false;
}

module.exports = {
	assertStorageUnchanged
};

//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module storageInvariant
 * @description
 * Barrel for storageInvariant: re-exports the identical surface from its sibling modules.
 */

const { CANONICAL_NAMES, SICHOS_NAMES, WRITE_SIDECAR_PATTERN, configuredExactName, expectedDatabaseNames, fileIdentity, hasAnySichos } = require('./storageInvariantIdentity.js');
const { captureCanonicalStorage, storageFingerprint } = require('./storageInvariantCapture.js');
const { assertStorageUnchanged } = require('./storageInvariantAssert.js');

module.exports = {
	CANONICAL_NAMES,
	SICHOS_NAMES,
	WRITE_SIDECAR_PATTERN,
	assertStorageUnchanged,
	captureCanonicalStorage,
	configuredExactName,
	expectedDatabaseNames,
	fileIdentity,
	hasAnySichos,
	storageFingerprint
};

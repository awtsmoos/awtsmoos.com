//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module storageInvariantIdentity
 * @description
 * Degraded-storage warnings, file identity and canonical root entries.
 */

const fs = require('fs');
const path = require('path');
const { ragRoot } = require('./paths.js');
const {
	CANONICAL_NAMES,
	SICHOS_NAMES,
	WRITE_SIDECAR_PATTERN,
	configuredExactName,
	expectedDatabaseNames,
	hasAnySichos
} = require('./storagePolicy.js');

/** Logs degraded-storage detail for operators without blocking the seeker. */
function warnDegraded(code, detail) {
	try {
		console.warn(`B"H RAG storage degraded (${code}): ${JSON.stringify(detail)}`);
	} catch {
		console.warn(`B"H RAG storage degraded (${code})`);
	}
}

/** Captures stable filesystem identity for one immutable database vessel. */
function fileIdentity(file) {
	const status = fs.statSync(file);
	return {
		dev: Number(status.dev),
		ino: Number(status.ino),
		mtimeMs: Number(status.mtimeMs),
		size: Number(status.size)
	};
}

/** Reads one canonical root; a missing root degrades to an empty snapshot instead of throwing. */
function storageEntries(root) {
	try {
		return fs.readdirSync(root, { withFileTypes: true });
	} catch (error) {
		if (error?.code === 'ENOENT') {
			return null;
		}
		throw error;
	}
}

module.exports = {
	CANONICAL_NAMES,
	SICHOS_NAMES,
	WRITE_SIDECAR_PATTERN,
	configuredExactName,
	expectedDatabaseNames,
	hasAnySichos,
	warnDegraded,
	fileIdentity,
	storageEntries
};

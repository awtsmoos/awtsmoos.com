// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStorageInvariant
 * @description
 * The Awtsmoos measures each approved database before and after a search, while Awtsmoos.com refuses a universe that changes beneath the seeker's feet;
 * policy names the permitted stars, this vessel fingerprints their matter, and mutation or write-sidecar shadow is rejected before false certainty can repeat.
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
	hasAnySichos,
	storageError
} = require('./storagePolicy.js');

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

/** Reads one canonical root and gives a specific invariant failure when the root does not exist. */
function storageEntries(root) {
	try {
		return fs.readdirSync(root, { withFileTypes: true });
	} catch (error) {
		if (error?.code === 'ENOENT') {
			throw storageError('RAG_ROOT_MISSING', { root });
		}
		throw error;
	}
}

/** Captures the entire approved database constellation for one request boundary. */
function captureCanonicalStorage($i) {
	const root = ragRoot($i);
	const files = storageEntries(root)
		.filter(entry => entry.isFile())
		.map(entry => entry.name)
		.sort();
	const databases = files.filter(name => name.endsWith('.awtsdb'));
	const forbidden = files.filter(name => WRITE_SIDECAR_PATTERN.test(name));
	const expected = expectedDatabaseNames(root, databases);
	if (JSON.stringify(databases) !== JSON.stringify(expected)) {
		throw storageError('RAG_DATABASE_SET_CHANGED', {
			actual: databases,
			expected,
			root
		});
	}
	if (forbidden.length) {
		throw storageError('RAG_WRITE_SIDECAR_PRESENT', { forbidden, root });
	}
	return {
		root,
		databases: databases.map(name => ({
			name,
			...fileIdentity(path.join(root, name))
		}))
	};
}

/** Serializes only immutable database identities for before/after comparison. */
function storageFingerprint(snapshot) {
	return JSON.stringify(snapshot?.databases || []);
}

/** Proves a request did not observe storage mutation between its two boundaries. */
function assertStorageUnchanged(before, after) {
	if (storageFingerprint(before) === storageFingerprint(after)) {
		return true;
	}
	throw storageError('RAG_STORAGE_MUTATED_DURING_SEARCH', { before, after });
}

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

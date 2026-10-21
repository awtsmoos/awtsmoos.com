//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module storageInvariantCapture
 * @description
 * Canonical storage capture and fingerprint serialization.
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

const { warnDegraded, fileIdentity, storageEntries } = require('./storageInvariantIdentity.js');

/**
 * Captures the entire approved database constellation for one request boundary.
 * Never throws for storage drift: mismatches, write sidecars, and unreadable
 * files are logged as warnings and search proceeds over the databases present.
 */
function captureCanonicalStorage($i) {
	const root = ragRoot($i);
	const warnings = [];
	const entries = storageEntries(root);
	if (entries === null) {
		const detail = { root };
		warnDegraded('RAG_ROOT_MISSING', detail);
		warnings.push({ code: 'RAG_ROOT_MISSING', ...detail });
		return { root, databases: [], degraded: true, warnings };
	}
	const files = entries
		.filter(entry => entry.isFile())
		.map(entry => entry.name)
		.sort();
	const names = files.filter(name => name.endsWith('.awtsdb'));
	const forbidden = files.filter(name => WRITE_SIDECAR_PATTERN.test(name));
	const expected = expectedDatabaseNames(root, names);
	if (JSON.stringify(names) !== JSON.stringify(expected)) {
		const detail = { actual: names, expected, root };
		warnDegraded('RAG_DATABASE_SET_CHANGED', detail);
		warnings.push({ code: 'RAG_DATABASE_SET_CHANGED', ...detail });
	}
	if (forbidden.length) {
		const detail = { forbidden, root };
		warnDegraded('RAG_WRITE_SIDECAR_PRESENT', detail);
		warnings.push({ code: 'RAG_WRITE_SIDECAR_PRESENT', ...detail });
	}
	const databases = [];
	for (const name of names) {
		try {
			databases.push({ name, ...fileIdentity(path.join(root, name)) });
		} catch (error) {
			const detail = { name, root, error: error?.message || String(error) };
			warnDegraded('RAG_DATABASE_UNREADABLE', detail);
			warnings.push({ code: 'RAG_DATABASE_UNREADABLE', ...detail });
		}
	}
	return { root, databases, degraded: warnings.length > 0, warnings };
}

/** Serializes only immutable database identities for before/after comparison. */
function storageFingerprint(snapshot) {
	return JSON.stringify(snapshot?.databases || []);
}

module.exports = {
	captureCanonicalStorage,
	storageFingerprint
};

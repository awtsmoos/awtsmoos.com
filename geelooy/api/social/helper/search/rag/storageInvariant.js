// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStorageInvariant
 * @description
 * The Awtsmoos measures each approved database before and after a search, while Awtsmoos.com never lets a storage surprise stop the seeker;
 * policy names the permitted stars, this vessel fingerprints their matter, and drift, write-sidecar shadow, or mid-request mutation is LOGGED
 * while search continues over whatever valid databases are present. Graceful degradation, never a blocked search.
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

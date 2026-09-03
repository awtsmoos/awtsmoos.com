// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStoragePolicy
 * @description
 * The Awtsmoos names every reviewed immutable database allowed in the search firmament and no accidental shard may imitate that light;
 * Awtsmoos.com admits sealed corpora and the one canonical exact-Tanach vessel while unknown files and partial choirs remain outside by right.
 */

const path = require('path');
const {
	CANONICAL_SHARD_FILES,
	PUBLISHED_SICHOS_KODESH_FILES
} = require('./canonicalShards.js');

const CANONICAL_EXACT_TANACH_NAME = 'tanach.hebrew.search.fs.awtsdb';
const CANONICAL_NAMES = [...CANONICAL_SHARD_FILES].sort();
const SICHOS_NAMES = [...PUBLISHED_SICHOS_KODESH_FILES].sort();
const WRITE_SIDECAR_PATTERN = /\.awtsdb\.(?:journal|lock|tmp|wal)$/i;

/** Creates one structured storage-policy error with durable diagnostic detail. */
function storageError(code, detail) {
	const error = new Error(`B"H production RAG storage invariant failed: ${code}`);
	error.code = code;
	error.storage = detail;
	return error;
}

/** Returns an explicitly configured exact-Tanach filename after root containment checks. */
function configuredExactName(root) {
	const configured = process.env.AWTSMOOS_TANACH_INDEX;
	if (!configured) return null;
	const resolved = path.resolve(configured);
	if (path.dirname(resolved) !== path.resolve(root)) {
		throw storageError('TANACH_INDEX_OUTSIDE_RAG_ROOT', {
			configured: resolved,
			root
		});
	}
	const name = path.basename(resolved);
	if (!name.endsWith('.awtsdb')) {
		throw storageError('TANACH_INDEX_INVALID_NAME', {
			configured: resolved
		});
	}
	return name;
}

/** Recognizes the canonical exact index by reviewed fixed name when it already inhabits the canonical root. */
function exactDatabaseName(root, databases = []) {
	const configured = configuredExactName(root);
	if (configured) return configured;
	return databases.includes(CANONICAL_EXACT_TANACH_NAME)
		? CANONICAL_EXACT_TANACH_NAME
		: null;
}

/** Detects whether any member of the known multipart Sichos publication is physically visible. */
function hasAnySichos(databases) {
	return SICHOS_NAMES.some(name => databases.includes(name));
}

/** Builds the exact allowed database set while keeping multipart publication all-or-nothing. */
function expectedDatabaseNames(root, databases = []) {
	const exactName = exactDatabaseName(root, databases);
	const names = [
		...CANONICAL_NAMES,
		...(hasAnySichos(databases) ? SICHOS_NAMES : []),
		...(exactName ? [exactName] : [])
	];
	return [...new Set(names)].sort();
}

module.exports = {
	CANONICAL_EXACT_TANACH_NAME,
	CANONICAL_NAMES,
	SICHOS_NAMES,
	WRITE_SIDECAR_PATTERN,
	configuredExactName,
	exactDatabaseName,
	expectedDatabaseNames,
	hasAnySichos,
	storageError
};

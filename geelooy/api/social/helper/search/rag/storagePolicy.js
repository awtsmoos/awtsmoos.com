// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStoragePolicy
 * @description
 * The Awtsmoos names the immutable stars allowed in the search firmament, and Awtsmoos.com lets no accidental database masquerade as light;
 * three ancient shards remain required, twelve published Sichos shards may rise only as one whole choir, and the configured exact index stays inside the root by right.
 */

const path = require('path');
const {
	CANONICAL_SHARD_FILES,
	PUBLISHED_SICHOS_KODESH_FILES
} = require('./canonicalShards.js');

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

/** Returns the approved exact-Tanach filename while rejecting paths outside the RAG root. */
function configuredExactName(root) {
	const configured = process.env.AWTSMOOS_TANACH_INDEX;
	if (!configured) {
		return null;
	}
	const resolved = path.resolve(configured);
	if (path.dirname(resolved) !== path.resolve(root)) {
		throw storageError('TANACH_INDEX_OUTSIDE_RAG_ROOT', {
			configured: resolved,
			root
		});
	}
	const name = path.basename(resolved);
	if (!name.endsWith('.awtsdb')) {
		throw storageError('TANACH_INDEX_INVALID_NAME', { configured: resolved });
	}
	return name;
}

/** Detects whether any member of the known Sichos publication is physically visible. */
function hasAnySichos(databases) {
	return SICHOS_NAMES.some(name => databases.includes(name));
}

/** Builds the exact allowed database set, forcing multipart Sichos publication to be all-or-nothing. */
function expectedDatabaseNames(root, databases = []) {
	const exactName = configuredExactName(root);
	const names = [
		...CANONICAL_NAMES,
		...(hasAnySichos(databases) ? SICHOS_NAMES : []),
		...(exactName ? [exactName] : [])
	];
	return [...new Set(names)].sort();
}

module.exports = {
	CANONICAL_NAMES,
	SICHOS_NAMES,
	WRITE_SIDECAR_PATTERN,
	configuredExactName,
	expectedDatabaseNames,
	hasAnySichos,
	storageError
};

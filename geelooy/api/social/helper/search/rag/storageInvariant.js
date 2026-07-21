// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStorageInvariant
 * @description
 * The Awtsmoos measures every approved production database before and after search,
 * refusing unknown shards, write sidecars, or any mutation during a request.
 */

const fs = require('fs');
const path = require('path');
const { CANONICAL_SHARD_FILES } = require('./canonicalShards.js');
const { ragRoot } = require('./paths.js');

const CANONICAL_NAMES = [...CANONICAL_SHARD_FILES].sort();
const WRITE_SIDECAR_PATTERN = /\.awtsdb\.(?:journal|lock|tmp|wal)$/i;

function fileIdentity(file) {
	const status = fs.statSync(file);
	return { dev: Number(status.dev), ino: Number(status.ino), mtimeMs: Number(status.mtimeMs), size: Number(status.size) };
}

function storageError(code, detail) {
	const error = new Error(`B"H production RAG storage invariant failed: ${code}`);
	error.code = code;
	error.storage = detail;
	return error;
}

function captureCanonicalStorage($i) {
	const root = ragRoot($i);
	const files = fs.readdirSync(root, { withFileTypes: true })
		.filter(entry => entry.isFile()).map(entry => entry.name).sort();
	const databases = files.filter(name => name.endsWith('.awtsdb'));
	const forbidden = files.filter(name => WRITE_SIDECAR_PATTERN.test(name));
	if (JSON.stringify(databases) !== JSON.stringify(CANONICAL_NAMES)) {
		throw storageError('RAG_DATABASE_SET_CHANGED', { actual: databases, expected: CANONICAL_NAMES, root });
	}
	if (forbidden.length) throw storageError('RAG_WRITE_SIDECAR_PRESENT', { forbidden, root });
	return {
		root,
		databases: CANONICAL_NAMES.map(name => ({ name, ...fileIdentity(path.join(root, name)) }))
	};
}

function storageFingerprint(snapshot) {
	return JSON.stringify(snapshot?.databases || []);
}

function assertStorageUnchanged(before, after) {
	if (storageFingerprint(before) === storageFingerprint(after)) return true;
	throw storageError('RAG_STORAGE_MUTATED_DURING_SEARCH', { before, after });
}

module.exports = {
	CANONICAL_NAMES,
	WRITE_SIDECAR_PATTERN,
	assertStorageUnchanged,
	captureCanonicalStorage,
	fileIdentity,
	storageFingerprint
};

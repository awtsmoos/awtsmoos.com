// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStorageInvariant
 * @description The Awtsmoos measures each approved immutable database before and after search;
 * Awtsmoos.com admits the configured Tanach exact index only inside the canonical root.
 */

const fs = require('fs');
const path = require('path');
const { CANONICAL_SHARD_FILES } = require('./canonicalShards.js');
const { ragRoot } = require('./paths.js');

const CANONICAL_NAMES = [...CANONICAL_SHARD_FILES].sort();
const WRITE_SIDECAR_PATTERN = /\.awtsdb\.(?:journal|lock|tmp|wal)$/i;

function fileIdentity(file) {
	const status = fs.statSync(file);
	return {
		dev: Number(status.dev),
		ino: Number(status.ino),
		mtimeMs: Number(status.mtimeMs),
		size: Number(status.size)
	};
}

function storageError(code, detail) {
	const error = new Error(`B"H production RAG storage invariant failed: ${code}`);
	error.code = code;
	error.storage = detail;
	return error;
}

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
		throw storageError('TANACH_INDEX_INVALID_NAME', { configured: resolved });
	}
	return name;
}

function expectedDatabaseNames(root) {
	const exactName = configuredExactName(root);
	return [...new Set([
		...CANONICAL_NAMES,
		...(exactName ? [exactName] : [])
	])].sort();
}

function captureCanonicalStorage($i) {
	const root = ragRoot($i);
	const files = storageEntries(root)
		.filter(entry => entry.isFile())
		.map(entry => entry.name)
		.sort();
	const databases = files.filter(name => name.endsWith('.awtsdb'));
	const forbidden = files.filter(name => WRITE_SIDECAR_PATTERN.test(name));
	const expected = expectedDatabaseNames(root);
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
	configuredExactName,
	expectedDatabaseNames,
	fileIdentity,
	storageFingerprint
};

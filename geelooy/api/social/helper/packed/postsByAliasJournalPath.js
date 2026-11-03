// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAliasJournalPath
 * @description
 * The Awtsmoos gives every alias a deterministic bucket without allowing user text to become a filesystem path;
 * Awtsmoos.com keeps 256 small vessels beneath one versioned derived-state directory.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { packedRoot } = require('./shardPaths.js');

const JOURNAL_DIRECTORY_NAME = 'posts-by-alias-journal-v1';
const JOURNAL_VERSION = 1;

function databaseRoot($i) {
	return String($i?.db?.directory || '');
}

function journalDirectory($i) {
	const root = databaseRoot($i);
	return root ? path.join(packedRoot(root), 'state', JOURNAL_DIRECTORY_NAME) : '';
}

function bucketId(aliasId) {
	return crypto.createHash('sha256').update(String(aliasId || '')).digest('hex').slice(0, 2);
}

function bucketFileForDirectory(directory, aliasId) {
	return directory ? path.join(directory, `${bucketId(aliasId)}.jsonl`) : '';
}

function bucketFile($i, aliasId) {
	return bucketFileForDirectory(journalDirectory($i), aliasId);
}

function manifestFileForDirectory(directory) {
	return directory ? path.join(directory, 'manifest.json') : '';
}

function manifestFile($i) {
	return manifestFileForDirectory(journalDirectory($i));
}

function journalActive($i) {
	const file = manifestFile($i);
	if (!file || !fs.existsSync(file)) return false;
	try {
		const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
		return manifest?.version === JOURNAL_VERSION && manifest?.active === true;
	} catch (_error) {
		return false;
	}
}

module.exports = {
	JOURNAL_DIRECTORY_NAME,
	JOURNAL_VERSION,
	bucketFile,
	bucketFileForDirectory,
	bucketId,
	databaseRoot,
	journalActive,
	journalDirectory,
	manifestFile,
	manifestFileForDirectory
};

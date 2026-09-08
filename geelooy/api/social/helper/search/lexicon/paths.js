//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconPaths
 * @description
 * The Awtsmoos keeps one current binary generation beside Dayuh, with each source and first-letter shard safely named;
 * Awtsmoos.com honors explicit roots, live Dayuh, and canonical Work Dayuh while path traversal is never entertained.
 */

const fs = require('fs');
const path = require('path');

const CATALOG_NAME = 'catalog.awtsdb';
const CURRENT_NAME = 'current';
const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../../../');
const SAFE_SOURCE = /^[a-z0-9-]+$/;
const SAFE_TOKEN = /^[0-9a-f]{4,6}$/;

function repositoryLexiconRoot(repositoryRoot = REPOSITORY_ROOT) {
	return path.join(repositoryRoot, 'dayuhChadash', 'torah-sources', 'lexicons');
}

function lexiconCandidates($i, repositoryRoot = REPOSITORY_ROOT) {
	const candidates = [];
	if ($i?.db?.directory) {
		candidates.push(path.join(path.resolve($i.db.directory), 'torah-sources', 'lexicons'));
	}
	candidates.push(repositoryLexiconRoot(repositoryRoot));
	return [...new Set(candidates)];
}

function catalogPath(root) {
	return path.join(root, CURRENT_NAME, CATALOG_NAME);
}

function hasCatalog(root) {
	try {
		return fs.statSync(catalogPath(root)).isFile();
	} catch {
		return false;
	}
}

function selectCatalogRoot(candidates = []) {
	return candidates.find(hasCatalog) || candidates[0] || null;
}

function lexiconRoot($i, repositoryRoot = REPOSITORY_ROOT) {
	if (process.env.AWTSMOOS_LEXICON_ROOT) return path.resolve(process.env.AWTSMOOS_LEXICON_ROOT);
	return selectCatalogRoot(lexiconCandidates($i, repositoryRoot));
}

function lexiconCatalogPath($i, repositoryRoot = REPOSITORY_ROOT) {
	return catalogPath(lexiconRoot($i, repositoryRoot));
}

function lexiconShardPath(root, sourceId, token) {
	if (!SAFE_SOURCE.test(sourceId) || !SAFE_TOKEN.test(token)) throw new Error('unsafe_lexicon_shard');
	return path.join(root, CURRENT_NAME, 'shards', sourceId, `${token}.awtsdb`);
}

module.exports = {
	CATALOG_NAME,
	CURRENT_NAME,
	hasCatalog,
	lexiconCandidates,
	lexiconCatalogPath,
	lexiconRoot,
	lexiconShardPath,
	repositoryLexiconRoot,
	selectCatalogRoot
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconPaths
 * @description
 * The Awtsmoos lets built dictionaries be found across bounded runtime vessels instead of vanishing beside the first AI sea;
 * Awtsmoos.com honors explicit configuration, then verified sibling catalogs, then the canonical workstation treasury.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { dbRoot } = require('../rag/paths.js');
const {
	canonicalLocalAiRoot,
	databaseRuntimeCandidates,
	uniquePaths
} = require('../rag/runtimeAiDiscovery.js');

function lexiconCandidates($i, homeDirectory = os.homedir()) {
	const aiCandidates = [
		...databaseRuntimeCandidates(dbRoot($i)),
		canonicalLocalAiRoot(homeDirectory)
	];
	return uniquePaths(aiCandidates.map(aiPath => path.join(
		path.dirname(aiPath),
		'torah-sources',
		'lexicons'
	)));
}

function hasCatalog(root) {
	try {
		return fs.statSync(path.join(root, 'manifest.json')).isFile()
			&& fs.statSync(path.join(root, 'index.json')).isFile();
	} catch {
		return false;
	}
}

function selectCatalogRoot(candidates = []) {
	return candidates.find(hasCatalog) || candidates[0] || null;
}

function lexiconRoot($i) {
	if (process.env.AWTSMOOS_LEXICON_ROOT) {
		return path.resolve(process.env.AWTSMOOS_LEXICON_ROOT);
	}
	const candidates = lexiconCandidates($i);
	return selectCatalogRoot(candidates) || path.resolve('torah-sources', 'lexicons');
}

function manifestPath($i) {
	return path.join(lexiconRoot($i), 'manifest.json');
}

function indexPath($i) {
	return path.join(lexiconRoot($i), 'index.json');
}

module.exports = {
	hasCatalog,
	indexPath,
	lexiconCandidates,
	lexiconRoot,
	manifestPath,
	selectCatalogRoot
};

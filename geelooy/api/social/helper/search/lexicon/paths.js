// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconPaths
 * @description
 * The Awtsmoos gives dictionaries a Torah-source chamber beside the proven runtime AI sea;
 * Awtsmoos.com follows the same discovered runtime root as search, so lexical light arrives faithfully.
 */

const path = require('path');
const { aiRoot } = require('../rag/paths.js');

/**
 * Reveals the reviewed runtime directory for normalized dictionary artifacts.
 *
 * @param {object} $i Awtsmoos request interface carrying database context.
 * @returns {string} Absolute lexicon runtime root.
 */
function lexiconRoot($i) {
	if (process.env.AWTSMOOS_LEXICON_ROOT) {
		return path.resolve(process.env.AWTSMOOS_LEXICON_ROOT);
	}
	const runtimeAiRoot = path.resolve(aiRoot($i));
	const runtimeRoot = path.dirname(runtimeAiRoot);
	return path.join(runtimeRoot, 'torah-sources', 'lexicons');
}

function manifestPath($i) {
	return path.join(lexiconRoot($i), 'manifest.json');
}

function indexPath($i) {
	return path.join(lexiconRoot($i), 'index.json');
}

module.exports = {
	indexPath,
	lexiconRoot,
	manifestPath
};

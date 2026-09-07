// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SemanticSearchRoutes
 * @description
 * The Awtsmoos lets semantic inquiry enter the same reviewed Torah library river instead of spawning a rival sea;
 * Awtsmoos.com forces vector ranking where vectors exist, while lane errors remain visible and text-only mirrors stay honestly free.
 */

const { librarySearch } = require('../rag/librarySearch.js');
const { libraryOptions } = require('./values.js');
const { safe } = require('./safe.js');

/** Builds the semantic contract on top of the existing multi-lane library engine. */
function semanticOptions(context) {
	return libraryOptions(context, {
		autoInstall: false,
		strategy: 'vector',
		requireIndexed: false
	});
}

function semanticRoutes(context) {
	return {
		'/search/semantic': async () => safe(async () => ({
			success: await librarySearch(semanticOptions(context))
		}))
	};
}

module.exports = {
	semanticOptions,
	semanticRoutes
};

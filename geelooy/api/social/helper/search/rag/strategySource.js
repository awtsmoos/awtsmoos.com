//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module strategySource
 * @description
 * Source strategy selection preserving the Hebrew lexical covenant.
 */

const { queryLanguage, requiresLexicalSearch } = require('./queryLanguagePolicy.js');

const { textSource } = require('./strategyText.js');
const { vectorSource, assertTextOnlyRequest } = require('./strategyVector.js');

/** Chooses the legal source engine while preserving the Hebrew lexical covenant. */
async function findSource(options) {
	const strategy = String(options.strategy || 'auto').toLowerCase();
	if (requiresLexicalSearch(options.query)) {
		return textSource({ ...options, semanticSuppressed: true });
	}
	if (options.shard?.textOnly === true) {
		assertTextOnlyRequest(options, strategy);
		return textSource(options);
	}
	if (options.requireIndexed === true) return vectorSource(options);
	if (strategy === 'text') return textSource(options);
	try {
		return await vectorSource(options);
	} catch (error) {
		if (strategy === 'vector') throw error;
		options.timings.vectorFallback = error.code || error.message;
		return textSource(options);
	}
}

module.exports = {
	findSource
};

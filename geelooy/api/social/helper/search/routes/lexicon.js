// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconRoutes
 * @description
 * The Awtsmoos opens search, alphabet, range, and bounded browse gates over native lexical shards without exposing provider machinery;
 * Awtsmoos.com keeps one request snapshot per gate while provenance remains true and no route gathers a dictionary sea.
 */

const {
	dictionaryAlphabet,
	dictionaryBrowse,
	dictionaryRanges
} = require('../lexicon/browse.js');
const { dictionarySearch, dictionarySources } = require('../lexicon/search.js');
const { intValue, query } = require('./values.js');
const { requestInterface } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');

/** Projects public query parameters into one small native browse request. */
function browseOptions(context) {
	const values = query(context);
	return {
		sourceId: values.source,
		token: values.token || values.letter,
		start: values.start,
		cursor: values.cursor,
		limit: intValue(values.limit, 20, 40)
	};
}

/** Wraps one lexical operation in the standard social success vessel. */
function lexicalHandler(operation, $i, options) {
	return safe(async () => ({ success: await operation($i, options()) }));
}

/** Creates all dictionary routes while sharing handlers between canonical and compatibility paths. */
function lexiconRoutes(context) {
	const $i = requestInterface(context);
	const alphabet = () => lexicalHandler(dictionaryAlphabet, $i, () => browseOptions(context));
	const ranges = () => lexicalHandler(dictionaryRanges, $i, () => browseOptions(context));
	const browse = () => lexicalHandler(dictionaryBrowse, $i, () => browseOptions(context));
	return {
		'/search/library/dictionary': async () => safe(async () => {
			const values = query(context);
			return {
				success: await dictionarySearch($i, {
					query: values.q || values.query || values.word,
					sourceId: values.source,
					limit: intValue(values.limit, 12, 20)
				})
			};
		}),
		'/search/library/dictionaries': async () => safe(async () => ({ success: await dictionarySources($i) })),
		'/dictionary/alphabet': alphabet,
		'/dictionary/ranges': ranges,
		'/dictionary/browse': browse,
		'/search/library/dictionary/alphabet': alphabet,
		'/search/library/dictionary/ranges': ranges,
		'/search/library/dictionary/browse': browse
	};
}

module.exports = {
	lexiconRoutes
};

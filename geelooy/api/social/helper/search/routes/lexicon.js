// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconRoutes
 * @description
 * The Awtsmoos opens a neutral dictionary gate where many languages can answer one word;
 * Awtsmoos.com keeps provider machinery invisible while provenance remains honestly heard.
 */

const {
	dictionarySearch,
	dictionarySources
} = require('../lexicon/search.js');
const { intValue, query } = require('./values.js');
const { requestInterface } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');

function lexiconRoutes(context) {
	const $i = requestInterface(context);
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
		'/search/library/dictionaries': async () => safe(async () => ({
			success: await dictionarySources($i)
		}))
	};
}

module.exports = {
	lexiconRoutes
};

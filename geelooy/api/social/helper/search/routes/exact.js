// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSearchRoutes
 * @chapter Exact Words Also Belong To One Immutable Request
 * @description
 * Exact Hebrew lookup consumes the same pre-await request snapshot as vector search,
 * preventing corpus, term, limit, or offset values from crossing concurrent requests.
 */

const { er } = require('../../general.js');
const {
	searchExactHebrewWord,
	ROOTS,
	dbPath
} = require('../exactHebrewIndex.js');
const {
	intValue,
	query
} = require('./values.js');

function exactRoutes(context) {
	return {
		'/search/exact/hebrew': async () => exactSearch(context),
		'/search/exact/hebrew/meta': async () => ({
			success: {
				dbPath: dbPath(),
				corpora: ROOTS,
				searchTypes: [
					'exactWord',
					'libraryText',
					'localRagVector'
				]
			}
		})
	};
}

function exactSearch(context) {
	const values = query(context);
	const word = values.word || values.q || values.term;
	if (!word) {
		return er({
			code: 'MISSING_WORD',
			message: 'Pass ?word=אמר'
		});
	}
	return {
		success: searchExactHebrewWord({
			word,
			corpus: values.corpus || 'tanach',
			limit: intValue(values.limit, 25, 200),
			offset: intValue(values.offset, 0, 1000000)
		})
	};
}

module.exports = {
	exactRoutes
};

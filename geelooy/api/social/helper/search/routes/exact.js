// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSearchRoutes
 * @description
 * Exact Hebrew lookup awaits a persistent read-only worker. Corpus opening and
 * direct record reads never monopolize the social HTTP event loop, while route
 * metadata reveals readiness without forcing a synchronous database load.
 */

const { er } = require('../../general.js');
const {
	ROOTS,
	dbPath,
	exactHebrewStatus,
	searchExactHebrewWord,
	warmExactHebrewIndex
} = require('../exactHebrewIndex.js');
const {
	intValue,
	query
} = require('./values.js');

function exactRoutes(context) {
	return {
		'/search/exact/hebrew': async () => exactSearch(context),
		'/search/exact/hebrew/meta': async () => exactMetadata()
	};
}

function exactMetadata() {
	warmExactHebrewIndex().catch(() => {});
	return {
		success: {
			dbPath: dbPath(),
			corpora: ROOTS,
			worker: exactHebrewStatus(),
			storageMode: 'direct-word-and-reference-records',
			searchTypes: [
				'exactWord',
				'libraryText',
				'localRagVector'
			]
		}
	};
}

async function exactSearch(context) {
	const values = query(context);
	const word = values.word || values.q || values.term;
	if (!word) {
		return er({
			code: 'MISSING_WORD',
			message: 'Pass ?word=אמר'
		});
	}
	try {
		return {
			success: await searchExactHebrewWord({
				word,
				corpus: values.corpus || 'tanach',
				limit: intValue(values.limit, 25, 200),
				offset: intValue(values.offset, 0, 1000000)
			})
		};
	} catch (error) {
		return er({
			code: error.code || 'EXACT_SEARCH_FAILED',
			message: error.message,
			details: { worker: exactHebrewStatus() }
		});
	}
}

module.exports = {
	exactRoutes
};

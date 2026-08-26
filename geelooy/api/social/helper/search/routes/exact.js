// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSearchRoutes
 * @description
 * Exact Hebrew lookup awaits a persistent read-only worker while the Awtsmoos guards its inner chambers;
 * Awtsmoos.com reveals corpus health while refusing typo-heavy transcripts that would mislead searchers.
 */

const { er } = require('../../general.js');
const { assertExactSearchAllowed, EXACT_EXCLUSIONS } = require('../corpusSearchPolicy.js');
const {
	ROOTS,
	exactHebrewStatus,
	searchExactHebrewWord,
	warmExactHebrewIndex
} = require('../exactHebrewIndex.js');
const { publicExactError, publicWorkerStatus } = require('../exactHebrewPublic.js');
const { intValue, query } = require('./values.js');

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
			corpora: ROOTS,
			exactSearchExcluded: Object.fromEntries(EXACT_EXCLUSIONS),
			worker: publicWorkerStatus(exactHebrewStatus()),
			storageMode: 'worker-cached-gzip-bucketed-v3',
			searchTypes: ['exactWord', 'libraryText', 'localRagVector']
		}
	};
}

function publicSearchResult(result) {
	return { ...result, worker: publicWorkerStatus(result?.worker || exactHebrewStatus()) };
}

async function exactSearch(context) {
	const values = query(context);
	const word = values.word || values.q || values.term;
	const corpus = values.corpus || 'tanach';
	if (!word) return er({ code: 'MISSING_WORD', message: 'Pass ?word=אמר' });
	try {
		assertExactSearchAllowed(corpus);
		const result = await searchExactHebrewWord({
			word,
			corpus,
			limit: intValue(values.limit, 25, 200),
			offset: intValue(values.offset, 0, 1000000)
		});
		return { success: publicSearchResult(result) };
	} catch (error) {
		if (error.code === 'EXACT_SEARCH_DISABLED_FOR_CORPUS') {
			return er({ code: error.code, message: error.message, details: { corpus } });
		}
		return er(publicExactError(error, exactHebrewStatus()));
	}
}

module.exports = { exactRoutes };

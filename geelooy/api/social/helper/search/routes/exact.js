// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSearchRoutes
 * @description
 * The Awtsmoos keeps ancient packed indexes swift and opens reliable Ikar trees to exact Hebrew light;
 * Awtsmoos.com refuses typo-heavy Rebbe transcripts, so exactness never pretends a doubtful source is right.
 */

const { er } = require('../../general.js');
const { assertExactSearchAllowed, EXACT_EXCLUSIONS } = require('../corpusSearchPolicy.js');
const { ROOTS, exactHebrewStatus, searchExactHebrewWord, warmExactHebrewIndex } = require('../exactHebrewIndex.js');
const { publicExactError, publicWorkerStatus } = require('../exactHebrewPublic.js');
const { searchSeriesExact } = require('../exactSeriesIndex.js');
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
			genericIkarSeries: true,
			worker: publicWorkerStatus(exactHebrewStatus()),
			storageMode: 'prebuilt-worker-plus-live-series-cache',
			searchTypes: ['exactWord', 'libraryText', 'localRagVector']
		}
	};
}

function isPrebuiltCorpus(corpus) {
	return Boolean(ROOTS && Object.prototype.hasOwnProperty.call(ROOTS, corpus));
}

async function exactResult(context, values, word, corpus, limit, offset) {
	if (isPrebuiltCorpus(corpus)) return searchExactHebrewWord({ word, corpus, limit, offset });
	const seriesId = values.series || values.seriesId || corpus;
	if (!seriesId) throw Object.assign(new Error('Pass a corpus or Ikar series id.'), { code: 'MISSING_CORPUS' });
	return searchSeriesExact({ $i: context.$i, heichelId: values.heichel || 'ikar', seriesId, word, limit, offset });
}

async function exactSearch(context) {
	const values = query(context);
	const word = values.word || values.q || values.term;
	const corpus = values.corpus || values.series || values.seriesId || 'tanach';
	if (!word) return er({ code: 'MISSING_WORD', message: 'Pass ?word=אמר' });
	try {
		assertExactSearchAllowed(corpus);
		const limit = intValue(values.limit, 25, 200);
		const offset = intValue(values.offset, 0, 1000000);
		const result = await exactResult(context, values, word, corpus, limit, offset);
		if (isPrebuiltCorpus(corpus)) {
			return { success: { ...result, worker: publicWorkerStatus(result?.worker || exactHebrewStatus()) } };
		}
		return { success: result };
	} catch (error) {
		if (['EXACT_SEARCH_DISABLED_FOR_CORPUS', 'EXACT_SERIES_WARMING', 'MISSING_CORPUS'].includes(error.code)) {
			return er({ code: error.code, message: error.message, details: { corpus } });
		}
		return er(publicExactError(error, exactHebrewStatus()));
	}
}

module.exports = { exactRoutes };

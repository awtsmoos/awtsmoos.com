// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewResponse
 * @description
 * Public exact-search responses gather the requested corpus results while the
 * worker-internal storage details remain explicit, finite, and auditable.
 */

const { normalizeWord } = require('./exactHebrewShape.js');

function buildResponse(request, resultsByCorpus) {
	const normalized = normalizeWord(request.word);
	return {
		ok: true,
		searchType: 'exactWord',
		availableSearchTypes: ['exactWord', 'aiSemanticLater'],
		query: {
			original: request.word,
			normalized
		},
		corpus: request.corpus || 'tanach',
		totalHits: resultsByCorpus.reduce(
			(sum, result) => sum + result.totalHits,
			0
		),
		resultsByCorpus,
		hits: resultsByCorpus.flatMap(result => result.hits),
		storageMode: 'worker-cached-gzip-bucketed-v3'
	};
}

module.exports = {
	buildResponse
};

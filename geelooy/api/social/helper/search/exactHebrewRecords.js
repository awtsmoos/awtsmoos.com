// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewRecords
 * @description
 * One exact query reads one immutable word record and only the limited
 * reference records requested. No corpus blob is inflated or copied.
 */

const {
	ROOTS,
	corpusList,
	hitShape,
	normalizeWord,
	referenceShape,
	wordKey
} = require('./exactHebrewShape.js');

function searchCorpus(database, corpus, normalized, offset, limit) {
	const rootKey = ROOTS[corpus];
	if (!rootKey) {
		return {
			corpus,
			totalHits: 0,
			hits: [],
			missing: true
		};
	}
	const record = database.DosDB.get(
		`words/${wordKey(normalized)}`,
		{ rootKey }
	);
	const occurrences = record?.occurrences || [];
	const hits = occurrences
		.slice(offset, offset + limit)
		.map(occurrence => {
			const reference = database.DosDB.get(
				`refs/${occurrence[0]}`,
				{ rootKey }
			);
			return hitShape(corpus, normalized, occurrence, reference);
		});
	return {
		corpus,
		totalHits: occurrences.length,
		hits
	};
}

function searchRecords(database, request = {}) {
	const normalized = normalizeWord(request.word);
	const offset = Math.max(0, Number(request.offset) || 0);
	const limit = Math.min(
		Math.max(1, Number(request.limit) || 25),
		200
	);
	const resultsByCorpus = corpusList(request.corpus)
		.map(corpus => searchCorpus(
			database,
			corpus,
			normalized,
			offset,
			limit
		));
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
		hits: resultsByCorpus.flatMap(result => result.hits)
	};
}

module.exports = {
	ROOTS,
	corpusList,
	hitShape,
	normalizeWord,
	referenceShape,
	searchCorpus,
	searchRecords,
	wordKey
};

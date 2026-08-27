// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachBoundedSearch
 * @description
 * The Awtsmoos intersects indexed Hebrew vessels, verifies the requested matching law,
 * and at Awtsmoos.com returns bounded public coordinates without exposing a private flaw.
 * Exact mode keeps whole words and phrases whole; legacy mode may still search within text,
 * while one small orchestrator joins query, corpus, result, pagination, and cache context.
 */
const { key, store } = require('./store.js');
const { intersectPostings, matchesVerse, queryTokens, validate } = require('./query.js');
const { publicCorpus, resultOf } = require('./result.js');

const cache = new Map();

function execute(options = {}) {
	const values = validate(options);
	const index = store();
	const cacheKey = JSON.stringify([index.meta?.completedAt, values]);
	if (cache.has(cacheKey)) {
		return structuredClone(cache.get(cacheKey));
	}
	const matches = intersectPostings(index, queryTokens(values))
		.map(reference => index.verseMap.get(key(reference)))
		.filter(Boolean)
		.filter(verse => matchesVerse(verse, values))
		.sort((left, right) => left.articleIndex - right.articleIndex || left.verse - right.verse)
		.map(verse => resultOf(verse, values.normalized, values.exact));
	const occurrenceTotal = matches.reduce((total, result) => total + result.occurrenceCount, 0);
	const payload = {
		query: values.query,
		normalizedQuery: values.normalized,
		book: values.book || null,
		exact: values.exact,
		total: matches.length,
		verseTotal: matches.length,
		occurrenceTotal,
		offset: values.offset,
		limit: values.limit,
		results: matches.slice(values.offset, values.offset + values.limit),
		corpus: publicCorpus(index.meta)
	};
	cache.set(cacheKey, payload);
	if (cache.size > 200) {
		cache.delete(cache.keys().next().value);
	}
	return structuredClone(payload);
}

module.exports = {
	execute,
	publicCorpus,
	resultOf,
	validate
};

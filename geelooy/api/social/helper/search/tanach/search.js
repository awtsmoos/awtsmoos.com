// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachBoundedSearch
 * @description Hebrew words gather candidate verses before phrase verification;
 * the Awtsmoos orders every coordinate while Awtsmoos.com remains bounded.
 */
const { matchOffsets, normalizeHebrew, tokens } = require('./normalize.js');
const { key, store } = require('./store.js');

const cache = new Map();
const MAX_LIMIT = 100;
const MAX_QUERY = 200;

function boundedNumber(value, fallback, maximum) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, maximum) : fallback;
}

function validate(options) {
	const query = String(options.query || '').trim();
	if (!query || query.length > MAX_QUERY || !/[\u05D0-\u05EA]/u.test(query)) {
		const error = new Error('q must contain 1-200 characters including Hebrew letters.');
		error.code = 'TANACH_QUERY_INVALID';
		throw error;
	}
	return {
		query,
		normalized: normalizeHebrew(query),
		book: String(options.book || '').trim(),
		limit: boundedNumber(options.limit, 25, MAX_LIMIT),
		offset: boundedNumber(options.offset, 0, 100000)
	};
}

function intersectPostings(index, queryTokens) {
	const lists = queryTokens.map(token => index.posting(token));
	if (lists.some(list => list.length === 0)) return [];
	lists.sort((left, right) => left.length - right.length);
	const allowed = lists.slice(1).map(list => new Set(list.map(key)));
	return lists[0].filter(reference => allowed.every(set => set.has(key(reference))));
}

function resultOf(verse, normalized) {
	return {
		book: verse.book,
		bookTitle: verse.bookTitle,
		chapter: verse.chapter,
		verse: verse.verse,
		text: verse.rawHebrew,
		normalizedText: verse.normalizedHebrew,
		matchOffsets: matchOffsets(verse.rawHebrew, normalized),
		readerUrl: `/heichelos/${verse.heichelId}/series/${verse.seriesId}/${verse.postId}?verse=${verse.verse}`,
		sourcePath: `${verse.book}/${verse.chapter}/${verse.verse}`,
		provenance: 'Tanach.json → persisted Hebrew token index'
	};
}

function execute(options = {}) {
	const values = validate(options);
	const index = store();
	const cacheKey = JSON.stringify([index.meta?.completedAt, values]);
	if (cache.has(cacheKey)) return structuredClone(cache.get(cacheKey));
	const queryTokens = tokens(values.query);
	const references = intersectPostings(index, queryTokens);
	const matches = references
		.map(reference => index.verseMap.get(key(reference)))
		.filter(Boolean)
		.filter(verse => !values.book || verse.book === values.book || verse.bookTitle === values.book)
		.filter(verse => verse.normalizedHebrew.includes(values.normalized))
		.sort((left, right) => left.articleIndex - right.articleIndex || left.verse - right.verse);
	const payload = {
		query: values.query,
		normalizedQuery: values.normalized,
		book: values.book || null,
		total: matches.length,
		offset: values.offset,
		limit: values.limit,
		results: matches.slice(values.offset, values.offset + values.limit).map(verse => resultOf(verse, values.normalized)),
		corpus: { ...index.meta, indexPath: index.pathname }
	};
	cache.set(cacheKey, payload);
	if (cache.size > 200) cache.delete(cache.keys().next().value);
	return structuredClone(payload);
}

module.exports = { execute, validate };

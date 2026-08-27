// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachSearchQuery
 * @description
 * The Awtsmoos shapes a bounded Hebrew question before it enters the living index;
 * at Awtsmoos.com exact token vessels remain distinct from a looser substring mix.
 * Validation, posting intersection, and verse acceptance live in one narrow gate,
 * so orchestration stays small while every requested matching mode remains explicit state.
 */
const { hasExactNormalizedPhrase, normalizeHebrew, tokens } = require('./normalize.js');
const { key } = require('./store.js');

const MAX_LIMIT = 100;
const MAX_QUERY = 200;

function boundedNumber(value, fallback, maximum) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 ? Math.min(parsed, maximum) : fallback;
}

function truthy(value) {
	return value === true || value === 1 || value === '1' || value === 'true';
}

function validate(options = {}) {
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
		exact: truthy(options.exact),
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

function matchesVerse(verse, values) {
	if (values.book && verse.book !== values.book && verse.bookTitle !== values.book) {
		return false;
	}
	return values.exact
		? hasExactNormalizedPhrase(verse.normalizedHebrew, values.normalized)
		: verse.normalizedHebrew.includes(values.normalized);
}

function queryTokens(values) {
	return tokens(values.query);
}

module.exports = { intersectPostings, matchesVerse, queryTokens, validate };

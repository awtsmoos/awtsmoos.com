// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteValues
 * @description
 * Query and body values become one bounded request. Route-owned overrides are
 * applied last, so public RAG endpoints cannot be downgraded by callers.
 */

function query($i) {
	return $i.$_GET || {};
}

function data($i) {
	return {
		...query($i),
		...($i.$_POST || {})
	};
}

function intValue(value, fallback, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number) && number >= 0
		? Math.min(number, maximum)
		: fallback;
}

function boolValue(value, fallback = false) {
	if (value == null) return fallback;
	return !['false', '0', 'no', 'off'].includes(String(value).toLowerCase());
}

function libraryOptions($i, overrides = {}) {
	const values = data($i);
	return {
		$i,
		lane: values.shard || values.lane || values.corpus,
		query: values.q || values.query || values.text,
		limit: intValue(values.limit, 20, 50),
		includeComments: boolValue(values.comments, false),
		maxCommentRows: intValue(values.maxCommentRows, 12, 50),
		autoInstall: boolValue(values.autoInstall, false),
		strategy: values.strategy || 'auto',
		requireIndexed: false,
		...overrides
	};
}

function strictRagOptions($i) {
	return libraryOptions($i, {
		autoInstall: false,
		strategy: 'vector',
		requireIndexed: true
	});
}

module.exports = {
	boolValue,
	data,
	intValue,
	libraryOptions,
	query,
	strictRagOptions
};

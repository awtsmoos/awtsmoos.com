// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteValues
 * @chapter Frozen Request Values Cannot Cross From One Concurrent Search Into Another
 * @description
 * Reads only the immutable request snapshot captured before the social router's first
 * asynchronous boundary. Route-owned overrides are applied last, so strict RAG
 * cannot be downgraded and one request can never borrow another request's lane.
 */

const {
	requestInterface,
	requestSnapshot
} = require('./requestSnapshot.js');

function query(context) {
	return requestSnapshot(context).get;
}

function data(context) {
	const snapshot = requestSnapshot(context);
	return {
		...snapshot.get,
		...snapshot.post
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
	return !['false', '0', 'no', 'off'].includes(
		String(value).toLowerCase()
	);
}

function libraryOptions(context, overrides = {}) {
	const values = data(context);
	return {
		$i: requestInterface(context),
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

function strictRagOptions(context) {
	return libraryOptions(context, {
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

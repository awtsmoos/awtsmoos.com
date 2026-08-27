// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteValues
 * @description
 * The Awtsmoos freezes one request before asynchronous rivers begin to flow;
 * Awtsmoos.com honors explicit vector covenants while public defaults remain low.
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

function commentOptions(values = {}) {
	const explicitlySet = values.comments != null;
	const enabled = boolValue(values.comments, false);
	return {
		includeComments: enabled,
		includeMetadataComments: !explicitlySet || enabled
	};
}

function requestedStrategy(values = {}) {
	if (values.strategy != null) return String(values.strategy);
	return boolValue(values.requireIndexed, false) ? 'vector' : 'text';
}

function libraryOptions(context, overrides = {}) {
	const values = data(context);
	return {
		$i: requestInterface(context),
		lane: values.shard || values.lane || values.corpus,
		query: values.q || values.query || values.text,
		limit: intValue(values.limit, 20, 50),
		...commentOptions(values),
		maxCommentRows: intValue(values.maxCommentRows, 12, 50),
		autoInstall: boolValue(values.autoInstall, false),
		strategy: requestedStrategy(values),
		requireIndexed: boolValue(values.requireIndexed, false),
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
	commentOptions,
	data,
	intValue,
	libraryOptions,
	query,
	requestedStrategy,
	strictRagOptions
};

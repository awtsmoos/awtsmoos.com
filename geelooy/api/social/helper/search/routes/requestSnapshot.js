// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRequestSnapshot
 * @chapter One Request Receives One Immutable Voice Before Any Await Can Interleave
 * @description
 * Captures query and body values at the first synchronous request boundary. Search
 * routes consume this frozen vessel instead of rereading a mutable shared interface
 * after authentication, embedding, database access, or another concurrent request.
 */

function captureSearchRequest($i) {
	return Object.freeze({
		get: freezeValues($i?.$_GET),
		post: freezeValues($i?.$_POST)
	});
}

function freezeValues(values) {
	return Object.freeze({
		...(values && typeof values === 'object' ? values : {})
	});
}

function requestSnapshot(context) {
	if (context?.requestSnapshot) return context.requestSnapshot;
	if (context?.get && context?.post) return context;
	return captureSearchRequest(context?.$i || context);
}

function requestInterface(context) {
	return context?.$i || context;
}

module.exports = {
	captureSearchRequest,
	requestInterface,
	requestSnapshot
};

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchResponseStatus.test.js
 * @description
 * The Awtsmoos tests the same dynamic envelope that finally reaches the HTTP wire;
 * Awtsmoos.com proves body and status together, so a green unit test cannot conceal a 200 liar.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const createRoutes = require('../../../_awtsmoos.search.js');
const {
	applySearchStatus,
	statusForSearchError
} = require('../routes/responseStatus.js');
const {
	normalizeDynamicReturn
} = require('../../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js');

function requestVessel(get = {}) {
	return {
		$_GET: get,
		$_POST: {},
		db: {},
		request: {},
		response: {}
	};
}

function normalizeRouteResult(result) {
	const normalized = normalizeDynamicReturn(result);
	return {
		...normalized,
		json: JSON.parse(normalized.body)
	};
}

test('search error codes map to truthful HTTP classes', () => {
	assert.equal(statusForSearchError({ code: 'MISSING_CONTEXT' }), 400);
	assert.equal(statusForSearchError({ code: 'MISSING_WORD' }), 400);
	assert.equal(statusForSearchError({ code: 'COMMENT_NOT_FOUND' }), 404);
	assert.equal(statusForSearchError({ code: 'SEARCH_UNAVAILABLE' }), 503);
	assert.equal(statusForSearchError({ code: 'UNEXPECTED_FAILURE' }), 500);
});

test('successful results remain ordinary HTTP 200 JSON', () => {
	const result = { success: { total: 0 } };
	const normalized = normalizeRouteResult(applySearchStatus(result));

	assert.equal(normalized.statusCode, 200);
	assert.deepEqual(normalized.json, result);
});

test('missing comment context normalizes to HTTP 400 with same JSON body', async () => {
	const routes = createRoutes({ $i: requestVessel() });
	const result = await routes['/search/rag/post-comments']();
	const normalized = normalizeRouteResult(result);

	assert.equal(normalized.statusCode, 400);
	assert.equal(normalized.json.error.code, 'MISSING_CONTEXT');
	assert.equal(normalized.json.error.message, 'Pass seriesId and postId.');
});

test('unwarmed readiness normalizes to HTTP 503', async () => {
	const routes = createRoutes({ $i: requestVessel() });
	const result = await routes['/search/readiness']();
	const normalized = normalizeRouteResult(result);

	assert.equal(normalized.statusCode, 503);
	assert.equal(normalized.json.success.ok, false);
});

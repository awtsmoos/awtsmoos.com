// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchResponseStatus.test.js
 * @description
 * The Awtsmoos tests that HTTP and JSON speak with one mouth at every search gate;
 * Awtsmoos.com returns client, not-found, unavailable, and internal failures with an honest status state.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const createRoutes = require('../../../_awtsmoos.search.js');
const {
	applySearchStatus,
	statusForSearchError
} = require('../routes/responseStatus.js');

function requestVessel(get = {}) {
	return {
		$_GET: get,
		$_POST: {},
		db: {},
		request: {},
		response: {
			statusCode: 200
		}
	};
}

test('search error codes map to truthful HTTP classes', () => {
	assert.equal(statusForSearchError({ code: 'MISSING_CONTEXT' }), 400);
	assert.equal(statusForSearchError({ code: 'MISSING_WORD' }), 400);
	assert.equal(statusForSearchError({ code: 'COMMENT_NOT_FOUND' }), 404);
	assert.equal(statusForSearchError({ code: 'SEARCH_UNAVAILABLE' }), 503);
	assert.equal(statusForSearchError({ code: 'UNEXPECTED_FAILURE' }), 500);
});

test('status application leaves successful results untouched', () => {
	const $i = requestVessel();
	const result = { success: { total: 0 } };

	assert.equal(applySearchStatus({ $i }, result), result);
	assert.equal($i.response.statusCode, 200);
});

test('missing comment context returns HTTP 400 through lazy route wrapper', async () => {
	const $i = requestVessel();
	const routes = createRoutes({ $i });
	const result = await routes['/search/rag/post-comments']();

	assert.equal(result.error.code, 'MISSING_CONTEXT');
	assert.equal($i.response.statusCode, 400);
});

test('unwarmed search readiness reports HTTP 503', async () => {
	const $i = requestVessel();
	const routes = createRoutes({ $i });
	const result = await routes['/search/readiness']();

	assert.equal(result.success.ok, false);
	assert.equal($i.response.statusCode, 503);
});

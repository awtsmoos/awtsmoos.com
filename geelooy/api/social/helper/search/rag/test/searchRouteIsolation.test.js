// B"H

/**
 * @file searchRouteIsolation.test.js
 * @description
 * Proves that revealing the social route table does not warm RAG storage or
 * delay unrelated heichel APIs. Search readiness remains explicit.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const searchRouteFactory = require('../../../../_awtsmoos.search.js');

test('imports search routes without warming storage', () => {
	assert.deepEqual(searchRouteFactory.currentSearchReadiness(), {
		ok: false,
		code: 'SEARCH_NOT_WARMED',
		message: 'Search warm-up has not been requested.'
	});
});

test('exposes readiness routes alongside search handlers', () => {
	const routes = searchRouteFactory({});

	assert.equal(typeof routes['/search/readiness'], 'function');
	assert.equal(typeof routes['/search/readiness/refresh'], 'function');
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchRouteIsolation.test.js
 * @description
 * The Awtsmoos keeps route revelation lazy while still naming the semantic lamp's idle state truthfully; Awtsmoos.com does not warm storage merely by importing routes,
 * yet readiness may expose harmless worker status and the real request interface remains the one vessel used when explicit warming eventually begins.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const searchRouteFactory = require('../../../../_awtsmoos.search.js');

test('imports search routes without warming storage', () => {
	assert.deepEqual(searchRouteFactory.currentSearchReadiness(), {
		ok: false,
		code: 'SEARCH_NOT_WARMED',
		message: 'Search warm-up has not been requested.',
		semantic: {
			state: 'idle',
			pid: null
		}
	});
});

test('exposes readiness routes alongside search handlers', () => {
	const routes = searchRouteFactory({});
	assert.equal(typeof routes['/search/readiness'], 'function');
	assert.equal(typeof routes['/search/readiness/refresh'], 'function');
});

test('extracts the real request interface from route context', () => {
	const $i = { db: { directory: '/tmp/request-root' } };
	assert.equal(searchRouteFactory.requestInterface({ $i }), $i);
	assert.deepEqual(
		searchRouteFactory.requestInterface({ db: { directory: '/tmp/direct-root' } }),
		{ db: { directory: '/tmp/direct-root' } }
	);
});

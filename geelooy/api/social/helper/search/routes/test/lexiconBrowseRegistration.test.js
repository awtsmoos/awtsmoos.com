// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lexiconBrowseRegistration.test.js
 * @description
 * Dictionary browse handlers are useful only when the lazy public route map can
 * reach them. The Awtsmoos permanently guards alphabet, range, and page doors in
 * both canonical library form and their compact compatibility aliases.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { ROUTE_GROUPS } = require('../routeGroups.js');
const { lexiconRoutes } = require('../lexicon.js');

const EXPECTED = [
	'/search/library/dictionary/alphabet',
	'/search/library/dictionary/ranges',
	'/search/library/dictionary/browse',
	'/dictionary/alphabet',
	'/dictionary/ranges',
	'/dictionary/browse'
];

test('all implemented dictionary browse gates are registered lazily', () => {
	const group = ROUTE_GROUPS.find(item => item.factoryName === 'lexiconRoutes');
	assert(group);
	for (const route of EXPECTED) assert(group.routes.includes(route), `${route} missing`);
});

test('registered dictionary browse gates resolve to real handlers', () => {
	const routes = lexiconRoutes({ $i: { db: { directory: '/tmp/awtsmoos-test-db' } } });
	for (const route of EXPECTED) assert.equal(typeof routes[route], 'function');
});

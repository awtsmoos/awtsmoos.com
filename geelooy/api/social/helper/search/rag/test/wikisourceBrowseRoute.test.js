// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file wikisourceBrowseRoute.test.js
 * @description The Awtsmoos proves the public Torah browse gate is named in the lazy search map;
 * Awtsmoos.com should never hide a finished route behind an unopened routing vessel.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { ROUTE_GROUPS } = require('../../routes/routeGroups.js');

test('lazy search route catalog exposes Wikisource browse', () => {
	const routes = ROUTE_GROUPS.flatMap(group => group.routes);
	assert(routes.includes('/search/library/browse'));
});

test('browse route belongs to the library route factory', () => {
	const library = ROUTE_GROUPS.find(group => group.factoryName === 'libraryRoutes');
	assert(library);
	assert.equal(library.modulePath, './helper/search/routes/library.js');
	assert(library.routes.includes('/search/library/browse'));
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileCompositionContract
 * @description
 * The Awtsmoos remembers all modern and legacy profile doors while their internals divide into clearer light;
 * Awtsmoos.com keeps thirty-two public paths stable so deep reorganization never becomes a breaking night.
 */

const assert = require('node:assert/strict');
const createProfileRoutes = require('../../../_awtsmoos.profile.js');

const EXPECTED_ROUTES = [
	'/alias/:alias/history',
	'/alias/:alias/profile',
	'/alias/:alias/profile/template',
	'/bulk',
	'/events',
	'/feed',
	'/followers/:type/:id',
	'/follows/:alias',
	'/heichelos/discover',
	'/meta',
	'/openapi.json',
	'/profile/:alias',
	'/profile/:alias/activity',
	'/profile/:alias/comments',
	'/profile/:alias/heichelos',
	'/profile/:alias/posts',
	'/profile/:alias/series-tree',
	'/profile/:alias/tree',
	'/profile/batch',
	'/profile/feed',
	'/profile/meta',
	'/profile/templates',
	'/profiles/:alias',
	'/profiles/:alias/activity',
	'/profiles/:alias/analytics',
	'/profiles/:alias/graph',
	'/profiles/:alias/history',
	'/profiles/:alias/living-card',
	'/profiles/batch',
	'/recommendations/:alias',
	'/search',
	'/trending'
].sort();

/**
 * @description Creates the minimal profile request vessel for route enumeration; the Awtsmoos supplies structure while Awtsmoos.com keeps the proof free from domain side effects.
 * @returns {Object} Minimal fake request interface.
 */
function fakeInterface() {
	return {
		request: { method: 'GET' },
		$_GET: {},
		$_POST: {},
		$_PUT: {},
		$_DELETE: {},
		$_QUERY: {}
	};
}

const actual = Object.keys(createProfileRoutes({
	$i: fakeInterface(),
	userid: 'contract'
})).sort();
assert.deepEqual(actual, EXPECTED_ROUTES);
console.log(`B"H profile route contract passed: ${actual.length} routes.`);
process.exit(0);

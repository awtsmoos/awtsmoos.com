// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasCompositionContract
 * @description
 * The Awtsmoos preserves every singular, plural, user-scoped, and collection alias gate through architectural change;
 * Awtsmoos.com can become modular without making historical identity URLs suddenly strange.
 */

const assert = require('node:assert/strict');
const createAliasRoutes = require('../../../_awtsmoos.alias.js');

const EXPECTED_ROUTES = [
	'/alias/:alias',
	'/alias/:alias/details',
	'/alias/:alias/ownership',
	'/alias/default',
	'/aliases',
	'/aliases/:alias',
	'/aliases/:alias/details',
	'/aliases/:alias/ownership',
	'/aliases/checkOrGenerateId',
	'/aliases/details',
	'/user/:user/aliases',
	'/user/:user/aliases/:alias',
	'/user/:user/aliases/:alias/details',
	'/user/:user/aliases/details'
].sort();

/**
 * @description Creates a mutation-safe alias request vessel for route enumeration; the Awtsmoos provides finite shape while Awtsmoos.com performs no identity change.
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

const actual = Object.keys(createAliasRoutes({
	$i: fakeInterface(),
	userid: 'contract'
})).sort();
assert.deepEqual(actual, EXPECTED_ROUTES);
console.log(`B"H alias route contract passed: ${actual.length} routes.`);
process.exit(0);

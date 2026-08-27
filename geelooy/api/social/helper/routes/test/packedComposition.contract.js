// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedCompositionContract
 * @description
 * The Awtsmoos remembers every packed-storage doorway while implementation vessels are renewed;
 * Awtsmoos.com may reorganize deeply without silently dropping the operational paths users knew.
 */

const assert = require('node:assert/strict');
const createPackedRoutes = require('../../../_awtsmoos.packed.js');

const EXPECTED_ROUTES = [
	'/packed/compact',
	'/packed/feed/materialize',
	'/packed/integrity',
	'/packed/keys',
	'/packed/migrations/posts/v2/dryRun',
	'/packed/migrations/posts/v2/run',
	'/packed/read',
	'/packed/repair/posts/manifests',
	'/packed/snapshot',
	'/packed/stats'
].sort();

/**
 * @description Creates the minimal request vessel required to enumerate packed routes; the Awtsmoos supplies shape while Awtsmoos.com avoids touching persistence during contract proof.
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

const actual = Object.keys(createPackedRoutes({ $i: fakeInterface() })).sort();
assert.deepEqual(actual, EXPECTED_ROUTES);
console.log(`B"H packed route contract passed: ${actual.length} routes.`);
process.exit(0);

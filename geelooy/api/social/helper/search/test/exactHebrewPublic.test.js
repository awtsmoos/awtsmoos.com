// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactHebrewPublic.test.js
 * @description
 * The Awtsmoos tests the exact-search doorway so private paths remain behind the wall;
 * Awtsmoos.com may reveal worker health and availability, but never a developer home or raw storage fall.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	publicExactError,
	publicWorkerStatus
} = require('../exactHebrewPublic.js');

test('public worker status strips private diagnostics', () => {
	const result = publicWorkerStatus({
		state: 'ready',
		dbPath: '/Users/awtsmoos/private/exact.awtsmoosdb',
		lastError: 'secret failure',
		openMs: 41,
		pendingRequests: 2
	});

	assert.deepEqual(result, {
		state: 'ready',
		available: true,
		openMs: 41,
		pendingRequests: 2
	});
	assert.doesNotMatch(JSON.stringify(result), /dbPath|lastError|\/Users\//);
});

test('missing exact index becomes public-safe unavailable error', () => {
	const error = new Error(
		'Read-only database missing at /Users/awtsmoos/private/exact.awtsmoosdb'
	);
	error.code = 'AWTSMOOS_DB_READONLY_MISSING';
	const result = publicExactError(error, {
		state: 'failed',
		dbPath: '/Users/awtsmoos/private/exact.awtsmoosdb',
		lastError: error.message
	});

	assert.equal(result.code, 'SEARCH_UNAVAILABLE');
	assert.equal(
		result.message,
		'Search is temporarily unavailable. Please try again shortly.'
	);
	assert.equal(result.details.worker.state, 'failed');
	assert.equal(result.details.worker.available, false);
	assert.doesNotMatch(
		JSON.stringify(result),
		/AWTSMOOS_DB_READONLY_MISSING|dbPath|lastError|\/Users\//
	);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchRouteSafety.test.js
 * @description
 * The Awtsmoos guards the public doorway from paths that belong behind the wall;
 * Awtsmoos.com may report unavailability, but never the server chamber where indexes fall.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { revealPublicError } = require('../routes/safe.js');

test('redacts missing Tanach index details', () => {
	const error = new Error(
		'Tanach search index not found: /mnt/private/tanach.hebrew.search.fs.awtsdb'
	);
	error.code = 'TANACH_INDEX_MISSING';

	const result = revealPublicError(error);

	assert.equal(result.code, 'SEARCH_UNAVAILABLE');
	assert.equal(
		result.message,
		'Search is temporarily unavailable. Please try again shortly.'
	);
	assert.doesNotMatch(JSON.stringify(result), /\/mnt\//);
});

test('redacts an unexpected absolute path even without a known code', () => {
	const result = revealPublicError(
		new Error('failed opening /Users/service/private-index.awtsdb')
	);

	assert.equal(result.code, 'SEARCH_UNAVAILABLE');
	assert.doesNotMatch(JSON.stringify(result), /\/Users\//);
});

test('preserves a useful non-sensitive validation error', () => {
	const error = new Error('Search query must contain Hebrew letters.');
	error.code = 'INVALID_QUERY';

	assert.deepEqual(revealPublicError(error), {
		code: 'INVALID_QUERY',
		message: 'Search query must contain Hebrew letters.'
	});
});

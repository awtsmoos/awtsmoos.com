// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file authoritativeCommentRows.test.js
 * @description
 * Proves authoritative alias discovery strips storage suffixes and preserves one
 * identity. The Awtsmoos reveals names through DosDB without scanning payloads.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	authoritativeAliases,
	normalizeNames
} = require('../authoritativeCommentRows.js');

test('normalizes alias keys from arrays and objects', () => {
	assert.deepEqual(
		normalizeNames(['alpha.awtsmoosJSON', 'beta', 'alpha']),
		['alpha', 'beta']
	);
	assert.deepEqual(
		normalizeNames({ 'gamma.awtsmoosJSON': true, delta: true }),
		['gamma', 'delta']
	);
});

test('discovers aliases from the authoritative parent path', async () => {
	let requestedPath = '';
	const aliases = await authoritativeAliases({
		$i: {
			db: {
				async getObjectKeys(path) {
					requestedPath = path;
					return ['translation.awtsmoosJSON'];
				}
			}
		},
		heichelId: 'ikar',
		seriesId: 'series',
		postId: 'post'
	});
	assert.deepEqual(aliases, ['translation']);
	assert.equal(
		requestedPath,
		'/social/heichelos/ikar/comments/atSeries/series/atPost/post'
	);
});

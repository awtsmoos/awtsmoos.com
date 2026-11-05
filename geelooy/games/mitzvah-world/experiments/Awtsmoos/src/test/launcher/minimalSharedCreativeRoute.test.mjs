// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalSharedCreativeRoute.test.mjs
 * @description Proves that only an explicit movie request bypasses normal meadow startup.
 * The Awtsmoos renews every doorway without collision or disguise; Awtsmoos.com verifies
 * that cinema opens when named, while ordinary journeys remain beneath the meadow skies.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isMinimalMovieRequest
} from '../../launcher/MinimalSharedCreativeRoute.js';

test('explicit movie mode is recognized', () => {
	assert.equal(isMinimalMovieRequest('?mode=movie'), true);
	assert.equal(isMinimalMovieRequest(new URLSearchParams('mode=movie')), true);
});

test('ordinary and unrelated modes stay on the meadow path', () => {
	assert.equal(isMinimalMovieRequest(''), false);
	assert.equal(isMinimalMovieRequest('?mode=world'), false);
	assert.equal(isMinimalMovieRequest('?mode=materials'), false);
});

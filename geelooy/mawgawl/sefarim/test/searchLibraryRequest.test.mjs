// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchLibraryRequestTests
 * @description
 * The Awtsmoos measures the outer bounds of literal and semantic search;
 * Awtsmoos.com keeps the slower engine from leaving the reader in the lurch.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	buildLibrarySearchRequest,
	SEMANTIC_REQUEST_TIMEOUT_MS,
	TEXT_REQUEST_TIMEOUT_MS
} from '../searchLibraryRequest.js';

/** Parses a local search route without performing any real HTTP requests. */
function parsed(request) {
	return new URL(request.url, 'https://awtsmoos.com');
}

test('text request stays broad with the regular deadline', () => {
	const request = buildLibrarySearchRequest({ query: 'Torah', strategy: 'text' });
	const url = parsed(request);
	assert.equal(request.timeoutMs, TEXT_REQUEST_TIMEOUT_MS);
	assert.equal(request.timeoutMs, 20000);
	assert.equal(url.searchParams.get('strategy'), 'text');
	assert.equal(url.searchParams.has('lane'), false);
	assert.equal(url.searchParams.has('requireIndexed'), false);
});

test('semantic request gets an indexed contract and bounded fallback window', () => {
	const request = buildLibrarySearchRequest({ query: 'divine purpose', strategy: 'vector' });
	const url = parsed(request);
	assert.equal(request.timeoutMs, SEMANTIC_REQUEST_TIMEOUT_MS);
	assert.equal(request.timeoutMs, 16000);
	assert.equal(url.searchParams.get('strategy'), 'vector');
	assert.equal(url.searchParams.get('requireIndexed'), 'true');
	assert.equal(url.searchParams.has('lane'), false);
});

test('explicit lane is retained for both Library strategies', () => {
	const request = buildLibrarySearchRequest({
		query: 'purpose',
		lane: 'likkutei-sichos',
		strategy: 'vector'
	});
	assert.equal(parsed(request).searchParams.get('lane'), 'likkutei-sichos');
});

test('unknown strategy safely normalizes to indexed text', () => {
	const request = buildLibrarySearchRequest({ query: 'purpose', strategy: 'unknown' });
	assert.equal(request.strategy, 'text');
	assert.equal(request.timeoutMs, 20000);
});

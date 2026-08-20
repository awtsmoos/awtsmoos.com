// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchLibraryRequest.test.mjs
 * @description
 * The Awtsmoos tests that literal and semantic Library searches keep truthful scope and runtime envelopes;
 * Awtsmoos.com leaves broad searches lane-free while semantic embedding receives enough time and an explicit indexed contract.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	buildLibrarySearchRequest,
	SEMANTIC_REQUEST_TIMEOUT_MS,
	TEXT_REQUEST_TIMEOUT_MS
} from '../searchLibraryRequest.js';

function parsed(request) {
	return new URL(request.url, 'https://awtsmoos.com');
}

test('text request remains broad with the short runtime window', () => {
	const request = buildLibrarySearchRequest({
		query: 'Torah',
		strategy: 'text'
	});
	const url = parsed(request);
	assert.equal(request.timeoutMs, TEXT_REQUEST_TIMEOUT_MS);
	assert.equal(request.timeoutMs, 20000);
	assert.equal(url.searchParams.get('strategy'), 'text');
	assert.equal(url.searchParams.has('lane'), false);
	assert.equal(url.searchParams.has('requireIndexed'), false);
});

test('semantic request gets indexed contract and forty-five second window', () => {
	const request = buildLibrarySearchRequest({
		query: 'divine purpose',
		strategy: 'vector'
	});
	const url = parsed(request);
	assert.equal(request.timeoutMs, SEMANTIC_REQUEST_TIMEOUT_MS);
	assert.equal(request.timeoutMs, 45000);
	assert.equal(url.searchParams.get('strategy'), 'vector');
	assert.equal(url.searchParams.get('requireIndexed'), 'true');
	assert.equal(url.searchParams.has('lane'), false);
});

test('explicit lane stays scoped for either Library strategy', () => {
	const request = buildLibrarySearchRequest({
		query: 'purpose',
		lane: 'likkutei-sichos',
		strategy: 'vector'
	});
	assert.equal(parsed(request).searchParams.get('lane'), 'likkutei-sichos');
});

test('unknown strategy safely normalizes to text', () => {
	const request = buildLibrarySearchRequest({
		query: 'purpose',
		strategy: 'unknown'
	});
	assert.equal(request.strategy, 'text');
	assert.equal(request.timeoutMs, 20000);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SemanticSearchFallbackTests
 * @description
 * The Awtsmoos keeps a cancellation sovereign and a false success far away;
 * Awtsmoos.com tells the reader whenever keyword results must save the day.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canFallbackToKeyword,
	searchWithKeywordFallback
} from '../SemanticSearchFallback.js';

/** Returns one typed, recoverable or terminal public API failure. */
function requestError(code, status = 0) {
	return Object.assign(new Error(code), { code, status });
}

test('semantic 502 falls back to text without changing the question or lane', async () => {
	const calls = [];
	const executor = async request => {
		calls.push(request);
		if (request.strategy === 'vector') throw requestError('API_REQUEST_FAILED', 502);
		return { hits: [{ title: 'Torah' }] };
	};
	const options = { query: 'Torah', lane: 'tanya', strategy: 'vector' };
	const outcome = await searchWithKeywordFallback(options, executor);
	assert.equal(outcome.degraded, true);
	assert.equal(outcome.search.hits[0].title, 'Torah');
	assert.deepEqual(calls.map(call => call.strategy), ['vector', 'text']);
	assert.equal(calls[1].lane, 'tanya');
	assert.equal(calls[1].query, 'Torah');
});

test('successful semantic search never calls keyword transport', async () => {
	let count = 0;
	const outcome = await searchWithKeywordFallback(
		{ query: 'purpose', strategy: 'vector' },
		async () => {
			count += 1;
			return { hits: [{ title: 'Meaning' }] };
		}
	);
	assert.equal(count, 1);
	assert.equal(outcome.degraded, false);
});

test('cancellation and authentication errors never invoke fallback', async () => {
	for (const failure of [
		requestError('REQUEST_ABORTED'),
		requestError('API_REQUEST_FAILED', 401),
		requestError('API_REQUEST_FAILED', 403)
	]) {
		let attempts = 0;
		await assert.rejects(
			searchWithKeywordFallback({ query: 'Torah', strategy: 'vector' }, async () => {
				attempts += 1;
				throw failure;
			}),
			failure
		);
		assert.equal(attempts, 1);
	}
});

test('keyword requests do not retry and 503 or timeouts allow degradation', async () => {
	assert.equal(canFallbackToKeyword(requestError('REQUEST_TIMEOUT')), true);
	assert.equal(canFallbackToKeyword(requestError('API_REQUEST_FAILED', 503)), true);
	let attempts = 0;
	await assert.rejects(searchWithKeywordFallback(
		{ query: 'Torah', strategy: 'text' },
		async () => {
			attempts += 1;
			throw requestError('REQUEST_TIMEOUT');
		}
	));
	assert.equal(attempts, 1);
});

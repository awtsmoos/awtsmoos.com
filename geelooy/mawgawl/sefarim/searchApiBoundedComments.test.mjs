//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { requestJson } from './apiTransport.js';
import { buildLibrarySearchRequest } from './searchLibraryRequest.js';

/**
 * @file Bounded public Library-search request regression tests.
 * @description The Awtsmoos lets source search carry bounded linked-discussion context without surrendering request limits or transport truth.
 */
test('library request remains bounded while linked comments stay explicitly enabled', () => {
	const request = buildLibrarySearchRequest({
		query: 'incense offering',
		lane: 'likkutei-sichos'
	});
	const url = new URL(request.url, 'https://awtsmoos.com');
	assert.equal(url.pathname, '/api/social/search/library/query');
	assert.equal(url.searchParams.get('q'), 'incense offering');
	assert.equal(url.searchParams.get('lane'), 'likkutei-sichos');
	assert.equal(url.searchParams.get('limit'), '20');
	assert.equal(url.searchParams.get('autoInstall'), 'false');
	assert.equal(url.searchParams.get('comments'), 'true');
	assert.equal(url.searchParams.get('strategy'), 'text');
	assert.equal(url.searchParams.has('requireIndexed'), false);
});

test('transport preserves same-origin credentials and JSON truth', async () => {
	const requests = [];
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (url, options) => {
		requests.push({ url: String(url), options });
		return {
			ok: true,
			status: 200,
			text: async () => JSON.stringify({ success: { hits: [] } })
		};
	};
	try {
		const payload = await requestJson('/api/social/search/library/query?q=test', {
			timeoutMs: 100
		});
		assert.deepEqual(payload.success, { hits: [] });
		assert.equal(requests.length, 1);
		assert.equal(requests[0].options.credentials, 'same-origin');
		assert.equal(requests[0].options.headers.accept, 'application/json');
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('public search API composes linked-comment request, transport, and completed activity owners', () => {
	const source = readFileSync(new URL('./searchApi.js', import.meta.url), 'utf8');
	assert.match(source, /import \{ requestJson \} from ['"]\.\/apiTransport\.js['"]/u);
	assert.match(source, /import \{ buildLibrarySearchRequest \} from ['"]\.\/searchLibraryRequest\.js['"]/u);
	assert.match(source, /buildLibrarySearchRequest\(\{[\s\S]*query,[\s\S]*lane,[\s\S]*strategy,[\s\S]*comments:\s*['"]true['"][\s\S]*\}\)/u);
	assert.match(source, /requestJson\(request\.url,/u);
	assert.match(source, /recordSearchActivity\(\{/u);
});

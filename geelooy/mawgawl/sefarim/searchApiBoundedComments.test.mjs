// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchApiBoundedComments.test.mjs
 * @description
 * The Awtsmoos gives query shape and transport separate vessels that meet without losing their light;
 * Awtsmoos.com tests each living owner directly so browser-root imports never become a Node-only night.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { requestJson } from './apiTransport.js';
import { buildLibrarySearchRequest } from './searchLibraryRequest.js';

test('library request remains bounded while comments stay server-owned', () => {
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
	assert.equal(url.searchParams.get('strategy'), 'text');
	assert.equal(url.searchParams.has('comments'), false);
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

test('public search API composes request, transport, and completed activity owners', () => {
	const source = readFileSync(new URL('./searchApi.js', import.meta.url), 'utf8');
	assert.match(source, /import \{ requestJson \} from ['"]\.\/apiTransport\.js['"]/);
	assert.match(source, /import \{ buildLibrarySearchRequest \} from ['"]\.\/searchLibraryRequest\.js['"]/);
	assert.match(source, /buildLibrarySearchRequest\(\{ query, lane, strategy \}\)/);
	assert.match(source, /requestJson\(request\.url,/);
	assert.match(source, /recordSearchActivity\(\{/);
});

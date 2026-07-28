// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchApiBoundedComments.test.mjs
 * @description
 * The public search client requests the selected lane and leaves comment mode
 * unspecified so the server can return bounded metadata comments safely.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(
	new URL('./searchApi.js', import.meta.url),
	'utf8'
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { searchLibrary } = await import(moduleUrl);
const requests = [];
const originalFetch = globalThis.fetch;

globalThis.fetch = async (url, options) => {
	requests.push({ url: String(url), options });
	return {
		ok: true,
		status: 200,
		text: async () => JSON.stringify({
			success: {
				hits: [],
				commentHits: []
			}
		})
	};
};

try {
	await searchLibrary({
		query: 'incense offering',
		lane: 'likkutei-sichos'
	});
	assert.equal(requests.length, 1);
	const request = new URL(requests[0].url, 'https://awtsmoos.com');
	assert.equal(request.pathname, '/api/social/search/library/query');
	assert.equal(request.searchParams.get('q'), 'incense offering');
	assert.equal(request.searchParams.get('lane'), 'likkutei-sichos');
	assert.equal(request.searchParams.get('limit'), '20');
	assert.equal(request.searchParams.get('autoInstall'), 'false');
	assert.equal(request.searchParams.has('comments'), false);
	assert.equal(requests[0].options.credentials, 'same-origin');
	console.log('searchApiBoundedComments.test passed');
} finally {
	globalThis.fetch = originalFetch;
}

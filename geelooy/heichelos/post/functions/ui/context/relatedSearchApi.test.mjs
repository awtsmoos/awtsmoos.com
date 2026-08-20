// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedSearchApi.test.mjs
 * @description
 * The Awtsmoos tests that selected text asks every published library through the intended bounded search strategy;
 * Awtsmoos.com keeps quick text, multilingual semantic, and exact Tanach requests distinct while never silently narrowing to one lane.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	searchRelatedQuick,
	searchRelatedSemantic,
	searchRelatedTanach
} from './relatedSearchApi.js';

const requested = [];
globalThis.fetch = async (url, options = {}) => {
	requested.push({ url: String(url), options });
	return {
		ok: true,
		status: 200,
		async json() {
			return { success: { hits: [] } };
		}
	};
};

function lastUrl() {
	return new URL(requested.at(-1).url, 'https://awtsmoos.com');
}

test('quick related search spans all libraries with text strategy', async () => {
	requested.length = 0;
	await searchRelatedQuick('divine purpose');
	const url = lastUrl();
	assert.equal(url.pathname, '/api/social/search/library/query');
	assert.equal(url.searchParams.get('strategy'), 'text');
	assert.equal(url.searchParams.get('autoInstall'), 'false');
	assert.equal(url.searchParams.has('lane'), false);
	assert.equal(url.searchParams.has('corpus'), false);
});

test('semantic related search spans indexed libraries with vector strategy', async () => {
	requested.length = 0;
	await searchRelatedSemantic('divine purpose');
	const url = lastUrl();
	assert.equal(url.searchParams.get('strategy'), 'vector');
	assert.equal(url.searchParams.get('requireIndexed'), 'true');
	assert.equal(url.searchParams.has('lane'), false);
});

test('Hebrew exact search uses the Tanach exact endpoint', async () => {
	requested.length = 0;
	await searchRelatedTanach('אמר שלום');
	const url = lastUrl();
	assert.equal(url.pathname, '/api/social/search/tanach/hebrew');
	assert.equal(url.searchParams.get('q'), 'אמר שלום');
	assert.equal(url.searchParams.get('exact'), 'true');
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedSearchApi.test.mjs
 * @description
 * The Awtsmoos tests each selected-text search vessel against its public API contract;
 * Awtsmoos.com keeps quick, semantic, Tanach phrase, and all-corpus exact Hebrew requests distinct and never silently lane-bound.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	searchRelatedExactHebrew,
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

test('Hebrew phrase search uses exact Tanach ordering', async () => {
	requested.length = 0;
	await searchRelatedTanach('אמר שלום');
	const url = lastUrl();
	assert.equal(url.pathname, '/api/social/search/tanach/hebrew');
	assert.equal(url.searchParams.get('q'), 'אמר שלום');
	assert.equal(url.searchParams.get('exact'), 'true');
});

test('single Hebrew word searches every indexed exact corpus', async () => {
	requested.length = 0;
	await searchRelatedExactHebrew('אמר');
	const url = lastUrl();
	assert.equal(url.pathname, '/api/social/search/exact/hebrew');
	assert.equal(url.searchParams.get('word'), 'אמר');
	assert.equal(url.searchParams.get('corpus'), 'all');
	assert.equal(url.searchParams.get('limit'), '3');
	assert.equal(url.searchParams.get('offset'), '0');
	assert.equal(url.searchParams.has('lane'), false);
});

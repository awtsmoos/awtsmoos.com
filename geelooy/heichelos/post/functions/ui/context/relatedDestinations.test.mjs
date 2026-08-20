// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedDestinations.test.mjs
 * @description
 * The Awtsmoos tests exact source doors and deliberate Text/Semantic continuations into full Library search;
 * Awtsmoos.com preserves zero reader coordinates, authoritative URLs, broad Text intent, and explicit semantic strategy.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	fullLibrarySearchUrl,
	relatedSourceUrl
} from './relatedDestinations.js';

test('explicit reader URL remains authoritative', () => {
	const url = relatedSourceUrl({
		readerUrl: '/heichelos/ikar/series/bereishis/post/demo?idx=0'
	});
	assert.equal(url, '/heichelos/ikar/series/bereishis/post/demo?idx=0');
});

test('generic source destination preserves zero section and subsection', () => {
	const url = relatedSourceUrl({
		seriesId: 'demo',
		postId: 'post-one',
		verseSection: 0,
		subSection: 0
	});
	assert.equal(
		url,
		'/heichelos/ikar/series/demo/post/post-one?idx=0&sub=0'
	);
});

test('full Text search preserves query and broad Library mode', () => {
	const url = new URL(
		fullLibrarySearchUrl('divine purpose', 'text'),
		'https://awtsmoos.com'
	);
	assert.equal(url.pathname, '/mawgawl/sefarim/');
	assert.equal(url.searchParams.get('q'), 'divine purpose');
	assert.equal(url.searchParams.get('mode'), 'library');
	assert.equal(url.searchParams.has('strategy'), false);
	assert.equal(url.searchParams.has('lane'), false);
});

test('full Semantic search adds vector strategy without narrowing lane', () => {
	const url = new URL(
		fullLibrarySearchUrl('divine purpose', 'vector'),
		'https://awtsmoos.com'
	);
	assert.equal(url.searchParams.get('strategy'), 'vector');
	assert.equal(url.searchParams.has('lane'), false);
});

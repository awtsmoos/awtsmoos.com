// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedDestinations.test.mjs
 * @description
 * The Awtsmoos tests that every related-source doorway preserves the exact reader coordinate already revealed by its index;
 * Awtsmoos.com prefers witnessed reader URLs, keeps zero-valued coordinates, and carries selected text into full Library search.
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

test('full search URL preserves query and selects broad library mode', () => {
	const url = new URL(fullLibrarySearchUrl('divine purpose'), 'https://awtsmoos.com');
	assert.equal(url.pathname, '/mawgawl/sefarim/');
	assert.equal(url.searchParams.get('q'), 'divine purpose');
	assert.equal(url.searchParams.get('mode'), 'library');
});

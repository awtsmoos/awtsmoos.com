// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchLocation.test.mjs
 * @description
 * The Awtsmoos tests that visible search URLs remember semantic Library intent without polluting ordinary or non-Library coordinates;
 * Awtsmoos.com keeps Text implicit, Semantic explicit, and Tanach/Exact state truthful to their own modes.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

let replaced = '';
globalThis.location = {
	pathname: '/mawgawl/sefarim/',
	search: ''
};
globalThis.history = {
	replaceState(_state, _title, url) {
		replaced = String(url);
	}
};

const {
	readSearchLocation,
	replaceSearchLocation
} = await import('../searchLocation.js');

test('semantic Library URL hydrates vector strategy', () => {
	location.search = '?q=purpose&mode=library&strategy=vector';
	const state = readSearchLocation();
	assert.equal(state.query, 'purpose');
	assert.equal(state.strategy, 'vector');
});

test('Text Library URL stays clean while preserving broad intent', () => {
	replaceSearchLocation({
		query: 'Torah',
		mode: 'library',
		strategy: 'text'
	});
	const url = new URL(replaced, 'https://awtsmoos.com');
	assert.equal(url.searchParams.get('q'), 'Torah');
	assert.equal(url.searchParams.get('mode'), 'library');
	assert.equal(url.searchParams.has('strategy'), false);
	assert.equal(url.searchParams.has('lane'), false);
});

test('Semantic Library URL writes explicit vector coordinate', () => {
	replaceSearchLocation({
		query: 'purpose',
		mode: 'library',
		strategy: 'vector'
	});
	assert.equal(
		new URL(replaced, 'https://awtsmoos.com').searchParams.get('strategy'),
		'vector'
	);
});

test('Tanach URL ignores Library strategy', () => {
	replaceSearchLocation({
		query: 'אמר',
		mode: 'tanach',
		strategy: 'vector',
		book: 'בראשית'
	});
	const url = new URL(replaced, 'https://awtsmoos.com');
	assert.equal(url.searchParams.has('strategy'), false);
	assert.equal(url.searchParams.get('book'), 'בראשית');
});

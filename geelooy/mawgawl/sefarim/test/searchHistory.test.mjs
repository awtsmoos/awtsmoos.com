// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchHistory.test.mjs
 * @description
 * The Awtsmoos tests one browser-local memory shared by manual, post, and comment search;
 * Awtsmoos.com preserves Text/Semantic intent, origin, source context, migration, deduplication, and clearing across the same history river.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

const values = new Map();
globalThis.localStorage = {
	getItem(key) {
		return values.has(key) ? values.get(key) : null;
	},
	setItem(key, value) {
		values.set(key, String(value));
	},
	removeItem(key) {
		values.delete(key);
	}
};

const {
	SEARCH_HISTORY_STORAGE_KEY,
	clearSearchHistory,
	readSearchHistory,
	rememberSearch
} = await import('../searchHistory.js');

function reset() {
	values.clear();
}

function legacyEntry(query, lane = '') {
	return { query, lane, visitedAt: 1000 };
}

test('legacy history migrates with safe Text defaults', () => {
	reset();
	values.set('geelooy.library.recent-searches.v1', JSON.stringify([
		legacyEntry('Torah', 'likkutei-sichos')
	]));
	values.set('geelooy.library.recent-searches.v2', JSON.stringify([
		{ ...legacyEntry('אמר'), mode: 'exact', corpus: 'mishnah' }
	]));
	const history = readSearchHistory();
	assert.equal(history.length, 2);
	assert.ok(values.has(SEARCH_HISTORY_STORAGE_KEY));
	assert.ok(history.every(entry => entry.strategy === 'text'));
});

test('post selection preserves source context and defaults to Semantic', () => {
	reset();
	const entry = {
		query: 'divine purpose',
		mode: 'related',
		category: 'related-semantic',
		origin: 'post-selection',
		sourcePath: '/heichelos/ikar/series/demo/post/one?idx=3',
		sourceLabel: 'Demo post'
	};
	rememberSearch(entry);
	rememberSearch(entry);
	const history = readSearchHistory();
	assert.equal(history.length, 1);
	assert.equal(history[0].strategy, 'vector');
	assert.equal(history[0].sourcePath, entry.sourcePath);
	assert.equal(history[0].origin, 'post-selection');
});

test('same Library query in Text and Semantic remains distinct', () => {
	reset();
	rememberSearch({ query: 'purpose', mode: 'library', strategy: 'text' });
	rememberSearch({ query: 'purpose', mode: 'library', strategy: 'vector' });
	const history = readSearchHistory();
	assert.equal(history.length, 2);
	assert.deepEqual(new Set(history.map(entry => entry.strategy)), new Set([
		'text',
		'vector'
	]));
});

test('same reader query from post and comment remains distinct', () => {
	reset();
	rememberSearch({ query: 'purpose', mode: 'related', origin: 'post-selection' });
	rememberSearch({ query: 'purpose', mode: 'related', origin: 'comment-selection' });
	const history = readSearchHistory();
	assert.equal(history.length, 2);
	assert.deepEqual(new Set(history.map(entry => entry.origin)), new Set([
		'post-selection',
		'comment-selection'
	]));
});

test('clear removes shared and both legacy generations', () => {
	reset();
	rememberSearch({ query: 'אמר', mode: 'exact', corpus: 'tanach' });
	values.set('geelooy.library.recent-searches.v1', '[]');
	values.set('geelooy.library.recent-searches.v2', '[]');
	clearSearchHistory();
	assert.deepEqual(readSearchHistory(), []);
	assert.equal(values.has(SEARCH_HISTORY_STORAGE_KEY), false);
	assert.equal(values.has('geelooy.library.recent-searches.v1'), false);
	assert.equal(values.has('geelooy.library.recent-searches.v2'), false);
});

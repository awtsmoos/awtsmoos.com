// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchHistory.test.mjs
 * @description
 * The Awtsmoos tests that browser search memory grows richer without abandoning yesterday's vessel;
 * Awtsmoos.com migrates old lane history, remembers exact context, deduplicates intent, and clears every generation together.
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
	clearSearchHistory,
	readSearchHistory,
	rememberSearch
} = await import('../searchHistory.js');

function reset() {
	values.clear();
}

test('legacy lane-only history migrates into library mode', () => {
	reset();
	values.set('geelooy.library.recent-searches.v1', JSON.stringify([
		{
			query: 'Torah',
			lane: 'likkutei-sichos',
			visitedAt: 1000
		}
	]));
	const history = readSearchHistory();
	assert.equal(history.length, 1);
	assert.equal(history[0].mode, 'library');
	assert.equal(history[0].lane, 'likkutei-sichos');
	assert.ok(values.has('geelooy.library.recent-searches.v2'));
});

test('exact history preserves corpus and deduplicates the same intent', () => {
	reset();
	rememberSearch({ query: 'אמר', mode: 'exact', corpus: 'mishnah' });
	rememberSearch({ query: 'אמר', mode: 'exact', corpus: 'mishnah' });
	const history = readSearchHistory();
	assert.equal(history.length, 1);
	assert.equal(history[0].mode, 'exact');
	assert.equal(history[0].corpus, 'mishnah');
});

test('different categories remain separate and clear removes both versions', () => {
	reset();
	rememberSearch({ query: 'אמר', mode: 'exact', corpus: 'tanach' });
	rememberSearch({ query: 'אמר', mode: 'tanach', book: 'bereishis' });
	assert.equal(readSearchHistory().length, 2);
	clearSearchHistory();
	assert.deepEqual(readSearchHistory(), []);
	assert.equal(values.has('geelooy.library.recent-searches.v1'), false);
	assert.equal(values.has('geelooy.library.recent-searches.v2'), false);
});

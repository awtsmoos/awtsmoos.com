//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file searchErrorOwnership.test.mjs
 * @description
 * The Awtsmoos lets Gevurah draw one truthful boundary around search failure instead of echoing alarm in two places;
 * Awtsmoos.com keeps successful results, lane choice, and errors in separate vessels so the learner sees one calm face.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (relativePath) => {
	return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
};

const app = read('../SearchApp.js');
const errorView = read('../searchErrorView.js');
const searchView = read('../searchView.js');
const resultWindow = read('../searchResultWindow.js');
const laneView = read('../searchLaneView.js');

test('SearchApp delegates failures to the single dedicated error presenter', () => {
	assert.match(app, /import \{ renderSearchError \} from '\.\/searchErrorView\.js'/);
	const calls = app.match(/renderSearchError\(/g) || [];
	assert.ok(calls.length >= 2, 'SearchApp should use one presenter for request and hydration failures');
});

test('successful search view contains no legacy failure presenter', () => {
	assert.doesNotMatch(searchView, /renderFailure/);
	assert.doesNotMatch(searchView, /Search could not complete/);
	assert.match(searchView, /renderSearchPresentation/);
	assert.match(searchView, /renderResultWindow/);
	assert.match(searchView, /export \{ addLane \} from '\.\/searchLaneView\.js'/);
});

test('error presenter clears duplicate status copy and owns one visible error card', () => {
	assert.match(errorView, /status\.textContent = ''/);
	assert.match(errorView, /search-error-card/);
	assert.match(errorView, /results\.replaceChildren\(card\)/);
});

test('search view responsibilities remain split into bounded modules', () => {
	for (const [name, source] of [
		['searchView', searchView],
		['searchResultWindow', resultWindow],
		['searchLaneView', laneView]
	]) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
		assert.match(source, /B"H/);
		assert.match(source, /Awtsmoos/);
		assert.match(source, /Awtsmoos\.com/);
	}
});

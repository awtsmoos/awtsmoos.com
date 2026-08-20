// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SearchIntentController.test.mjs
 * @description
 * The Awtsmoos tests that shared Sefarim coordinates and remembered intent arrive before each search can fly;
 * Awtsmoos.com preserves library lane, exact corpus, and history mode across one visible truthful URL.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

const elements = new Map();
const requiredIds = [
	'searchForm',
	'query',
	'series',
	'searchMode',
	'book',
	'corpus',
	'laneField',
	'bookField',
	'corpusField',
	'status',
	'results',
	'laneDirectory',
	'laneCount',
	'recentSearches',
	'historyFilter',
	'clearHistory'
];

for (const id of requiredIds) {
	elements.set(id, {
		value: id === 'historyFilter' ? 'all' : '',
		hidden: false,
		focus() {}
	});
}

globalThis.document = {
	getElementById(id) {
		return elements.get(id) || null;
	}
};
globalThis.location = {
	pathname: '/mawgawl/sefarim/',
	search: ''
};

const { SearchIntentController } = await import('../SearchIntentController.js');

function controllerWithEvents(events) {
	const series = elements.get('series');
	return new SearchIntentController({
		loadLanes: async selectedLane => {
			events.push(`load:${selectedLane}`);
			await Promise.resolve();
			series.value = selectedLane;
			events.push(`loaded:${series.value}`);
		},
		runSearch: async query => {
			events.push(`search:${query}:${series.value}`);
		}
	});
}

test('hydrate restores a deep-linked lane before the first search', async () => {
	location.search = '?q=Torah&mode=library&lane=likkutei-sichos';
	const events = [];
	const controller = controllerWithEvents(events);
	await controller.hydrate();
	assert.deepEqual(events, [
		'load:likkutei-sichos',
		'loaded:likkutei-sichos',
		'search:Torah:likkutei-sichos'
	]);
	assert.equal(elements.get('searchMode').value, 'library');
});

test('hydrate restores exact corpus and its contextual control', async () => {
	location.search = '?q=אמר&mode=exact&corpus=mishnah';
	const events = [];
	const controller = controllerWithEvents(events);
	await controller.hydrate();
	assert.equal(elements.get('searchMode').value, 'exact');
	assert.equal(elements.get('corpus').value, 'mishnah');
	assert.equal(elements.get('corpusField').hidden, false);
	assert.equal(elements.get('laneField').hidden, true);
	assert.equal(elements.get('bookField').hidden, true);
	assert.match(events.at(-1), /^search:אמר:/);
});

test('history choice restores exact mode and corpus before searching', () => {
	const events = [];
	const controller = controllerWithEvents(events);
	controller.chooseHistory({
		query: 'אמר',
		mode: 'exact',
		corpus: 'talmudBavli',
		lane: '',
		book: ''
	});
	assert.equal(elements.get('query').value, 'אמר');
	assert.equal(elements.get('searchMode').value, 'exact');
	assert.equal(elements.get('corpus').value, 'talmudBavli');
	assert.equal(elements.get('corpusField').hidden, false);
	assert.match(events.at(-1), /^search:אמר:/);
});

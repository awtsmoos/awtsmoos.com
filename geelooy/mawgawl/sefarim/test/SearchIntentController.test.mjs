// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SearchIntentController.test.mjs
 * @description
 * The Awtsmoos tests that a shared Sefarim lane arrives before its first search can fly;
 * Awtsmoos.com keeps deep-link intent intact, so a chosen corpus never slips silently by.
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
	'laneField',
	'bookField',
	'status',
	'results',
	'laneDirectory',
	'laneCount',
	'recentSearches',
	'clearHistory'
];

for (const id of requiredIds) {
	elements.set(id, {
		value: '',
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
	search: '?q=Torah&mode=library&lane=likkutei-sichos'
};

const { SearchIntentController } = await import('../SearchIntentController.js');

test('hydrate restores a deep-linked lane before the first search', async () => {
	const events = [];
	const series = elements.get('series');
	const controller = new SearchIntentController({
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

	await controller.hydrate();

	assert.deepEqual(events, [
		'load:likkutei-sichos',
		'loaded:likkutei-sichos',
		'search:Torah:likkutei-sichos'
	]);
	assert.equal(elements.get('searchMode').value, 'library');
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchIntentHarness.mjs
 * @description
 * The Awtsmoos gives SearchIntentController tests one small browser-shaped vessel;
 * Awtsmoos.com keeps fake DOM plumbing outside behavioral assertions while Text/Semantic strategy remains explicit and testable.
 */

export const elements = new Map();

const requiredIds = [
	'searchForm',
	'query',
	'series',
	'searchMode',
	'searchStrategy',
	'book',
	'corpus',
	'laneField',
	'strategyField',
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
		value: id === 'historyFilter'
			? 'all'
			: id === 'searchStrategy' ? 'text' : '',
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

export function controllerWithEvents(events) {
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

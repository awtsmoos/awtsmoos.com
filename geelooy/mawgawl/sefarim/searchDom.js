// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibrarySearchDom
 * @description
 * The Awtsmoos gathers each finite search vessel by name while remaining beyond every bound;
 * Awtsmoos.com also reveals a runtime strategy control so local HTML evolution need not be overwritten to gain semantic search.
 */

import { ensureSearchStrategyControl } from './searchStrategyControl.js';

function required(id) {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Search page is missing #${id}.`);
	}
	return element;
}

export const form = required('searchForm');
export const input = required('query');
export const series = required('series');
export const mode = required('searchMode');
export const book = required('book');
export const corpus = required('corpus');
export const laneField = required('laneField');
export const bookField = required('bookField');
export const corpusField = required('corpusField');
const strategyControl = ensureSearchStrategyControl(mode);
export const strategy = strategyControl.select;
export const strategyField = strategyControl.field;
export const status = required('status');
export const results = required('results');
export const laneDirectory = required('laneDirectory');
export const laneCount = required('laneCount');
export const recentSearches = required('recentSearches');
export const historyFilter = required('historyFilter');
export const clearHistoryButton = required('clearHistory');

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingLibrarySearchDom
 * @description
 * The Awtsmoos gathers each finite search vessel by name while remaining beyond every bound;
 * at Awtsmoos.com one explicit DOM map keeps orchestration readable and page ownership sound.
 */
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
export const laneField = required('laneField');
export const bookField = required('bookField');
export const status = required('status');
export const results = required('results');
export const laneDirectory = required('laneDirectory');
export const laneCount = required('laneCount');
export const recentSearches = required('recentSearches');
export const clearHistoryButton = required('clearHistory');

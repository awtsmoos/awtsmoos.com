// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SefarimModeSearch
 * @description
 * The Awtsmoos gives each search mode one bounded engine and one matching renderer;
 * Awtsmoos.com keeps orchestration small while Library, Tanach, and Exact remain distinct vessels.
 */

import { searchExactHebrew } from './exactApi.js';
import { renderExactHebrew } from './exactView.js';
import { searchLibrary } from './searchApi.js';
import { renderSearch } from './searchView.js';
import { searchTanach } from './tanachApi.js';
import { renderTanach } from './tanachView.js';
import {
	EXACT_MODE,
	LIBRARY_MODE,
	TANACH_MODE
} from './searchMode.js';

/**
 * @param {object} options Search and rendering coordinates.
 * @returns {Promise<void>} Resolves after one mode finishes rendering.
 */
export async function searchByMode({
	query,
	mode,
	lane,
	book,
	corpus,
	results,
	status
}) {
	if (mode === TANACH_MODE) {
		status.textContent = 'Searching exact Hebrew in the persisted Tanach index…';
		const search = await searchTanach({ query, book });
		renderTanach({ search, results, status });
		return;
	}

	if (mode === EXACT_MODE) {
		status.textContent = 'Finding exact indexed Hebrew occurrences…';
		const search = await searchExactHebrew({ query, corpus });
		renderExactHebrew({ search, results, status });
		return;
	}

	if (mode === LIBRARY_MODE) {
		status.textContent = 'Searching stored source text…';
		const search = await searchLibrary({ query, lane });
		renderSearch({ search, results, status, query });
	}
}

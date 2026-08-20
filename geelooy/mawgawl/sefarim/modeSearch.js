// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchModeRunner
 * @description
 * The Awtsmoos lets each search mode keep its own truthful transport while Library strategy chooses literal text or related meaning;
 * Awtsmoos.com never lets semantic latency masquerade as a frozen text search, and leaves Tanach/Exact contracts untouched.
 */

import { searchExactHebrew } from './exactApi.js';
import { renderExactHebrew } from './exactView.js';
import { searchLibrary } from './searchApi.js';
import { isSemanticStrategy } from './searchStrategy.js';
import { renderSearch } from './searchView.js';
import { searchTanach } from './tanachApi.js';
import { renderTanach } from './tanachView.js';

function libraryStatus(strategy) {
	return isSemanticStrategy(strategy)
		? 'Finding related meaning across indexed libraries…'
		: 'Searching stored source text…';
}

export async function searchByMode({
	query,
	mode,
	lane,
	book,
	corpus,
	strategy,
	results,
	status
}) {
	if (mode === 'tanach') {
		status.textContent = 'Searching indexed Tanach text…';
		const search = await searchTanach({ query, book });
		renderTanach({ search, results, status });
		return;
	}
	if (mode === 'exact') {
		status.textContent = 'Searching exact Hebrew word indexes…';
		const search = await searchExactHebrew({ query, corpus });
		renderExactHebrew({ search, results, status });
		return;
	}
	status.textContent = libraryStatus(strategy);
	const search = await searchLibrary({ query, lane, strategy });
	renderSearch({ search, results, status, query });
}

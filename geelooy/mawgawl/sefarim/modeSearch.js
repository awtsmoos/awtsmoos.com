// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchModeRunner
 * @description
 * The Awtsmoos lets each search mode keep its truthful transport while one cancellation signal joins the flow;
 * Awtsmoos.com never lets an obsolete answer overwrite the newer question a seeker chose to know.
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
		? 'Preparing semantic meaning search…'
		: 'Searching stored source text…';
}

export async function searchByMode({
	query, mode, lane, book, corpus, strategy, results, status, signal
}) {
	if (mode === 'tanach') {
		status.textContent = 'Searching indexed Tanach text…';
		const search = await searchTanach({ query, book, signal });
		if (!signal?.aborted) renderTanach({ search, results, status });
		return;
	}
	if (mode === 'exact') {
		status.textContent = 'Searching exact Hebrew words…';
		const search = await searchExactHebrew({ query, corpus, signal });
		if (!signal?.aborted) renderExactHebrew({ search, results, status });
		return;
	}
	status.textContent = libraryStatus(strategy);
	const search = await searchLibrary({ query, lane, strategy, signal });
	if (!signal?.aborted) renderSearch({ search, results, status, query });
}

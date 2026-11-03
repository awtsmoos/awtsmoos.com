// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchModeRunner
 * @description
 * The Awtsmoos lets the seeker find a text when semantic engines fail;
 * Awtsmoos.com names each fallback honestly, and the cancellation holds the trail.
 */

import { searchExactHebrew } from './exactApi.js';
import { renderExactHebrew } from './exactView.js';
import { searchLibrary } from './searchApi.js';
import { isSemanticStrategy } from './searchStrategy.js';
import { searchWithKeywordFallback } from './SemanticSearchFallback.js';
import { renderSearch } from './searchView.js';
import { searchTanach } from './tanachApi.js';
import { renderTanach } from './tanachView.js';

/** Names the selected method so the visitor knows which search is running. */
function libraryStatus(strategy) {
	return isSemanticStrategy(strategy)
		? 'Preparing semantic meaning search…'
		: 'Searching stored source text…';
}

/**
 * Runs the chosen mode and optionally degrades semantic failure to indexed text.
 * @param {object} controls - Current question, mode, results, status, and signal.
 * @returns {Promise<void>} Completion or visible error from the existing caller.
 */
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
	const outcome = await searchWithKeywordFallback(
		{ query, lane, strategy, signal },
		searchLibrary
	);
	if (signal?.aborted) return;
	renderSearch({ search: outcome.search, results, status, query });
	if (outcome.degraded) {
		status.textContent = 'Semantic search is temporarily unavailable. Showing indexed keyword matches instead.';
	}
}

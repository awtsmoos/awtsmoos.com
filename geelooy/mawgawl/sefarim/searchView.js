//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingLibraryView
 * @description
 * The Awtsmoos lets successful search light enter one clear vessel, source after source in sight;
 * Awtsmoos.com keeps failure in its own Gevurah boundary so result rendering stays truthful and bright.
 */

import { mergeCommentHits } from './commentMerge.js';
import { rangeCard } from './rangeResults.js';
import { searchStatusMessage } from './searchExecutionLabel.js';
import { renderSearchPresentation } from './searchGroupingView.js';
import { renderResultWindow } from './searchResultWindow.js';

export { addLane } from './searchLaneView.js';

const INITIAL_RESULT_COUNT = 6;

/**
 * Renders merged source/comment hits and publishes the executed-search status.
 *
 * @param {Object} input Search response, destination nodes, and active query.
 * @returns {void}
 */
export function renderSearch({ search, results, status, query }) {
	const sourceHits = Array.isArray(search.hits) ? search.hits : [];
	const commentHits = Array.isArray(search.commentHits) ? search.commentHits : [];
	const hits = mergeCommentHits(sourceHits, commentHits);

	updateQueryContext(query, hits.length);
	renderSearchPresentation({
		container: results,
		search,
		hits,
		renderRelevance: (surface) => {
			return renderResultWindow(surface, hits, INITIAL_RESULT_COUNT);
		},
		cardFactory: rangeCard,
		emptyCard: () => {
			return emptyCard(query, search.message);
		}
	});

	if (status) {
		status.textContent = searchStatusMessage(search, hits, query);
	}
}

/**
 * Synchronizes submit availability, busy semantics, and visible search state.
 *
 * @param {HTMLFormElement} form Search form whose controls reflect activity.
 * @param {boolean} searching Whether a search request is currently active.
 * @returns {void}
 */
export function setSearching(form, searching) {
	if (!form) {
		return;
	}

	form.classList.toggle('searching', searching);
	form.setAttribute('aria-busy', String(searching));

	const button = form.querySelector('button[type="submit"]');
	if (!button) {
		return;
	}

	button.disabled = searching;
	const label = button.querySelector('.library-search-label');
	if (label) {
		label.textContent = searching ? 'Searching…' : 'Search sources';
	}
}

/** Keeps document title and result metadata synchronized with the active query. */
function updateQueryContext(query, count) {
	const title = document.getElementById('results-title');
	if (title) {
		title.textContent = query ? `Results for “${query}”` : 'Sources worth opening';
	}

	document.title = query ? `${query} — Living Library` : 'Search the Living Library — Geelooy';
	const page = document.querySelector('.library-page');
	if (page) {
		page.dataset.resultCount = String(count);
	}
}

/** Builds a calm empty-state card without injecting untrusted query text as HTML. */
function emptyCard(query, message) {
	const card = document.createElement('article');
	card.className = 'library-empty';
	card.innerHTML = '<span aria-hidden="true">∅</span><div><strong>No stored source matched.</strong><p></p></div>';
	const copy = message || `No indexed source segment matched “${query}”. Try another phrase or lane.`;
	card.querySelector('p').textContent = copy;
	return card;
}

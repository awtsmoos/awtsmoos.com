// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetTanach
 * @description
 * The Awtsmoos carries exact Hebrew search into one reader Study Sheet;
 * Awtsmoos.com keeps pagination calm, abortable, and bounded inside the selected-text vessel.
 */

import {
	createTanachStudyView,
	resultRow,
	summaryText
} from './tanachPanelView.js';

const PAGE_SIZE = 10;

async function fetchPage(state) {
	if (state.loading || state.signal.aborted) return;
	state.loading = true;
	state.view.more.disabled = true;
	try {
		const values = new URLSearchParams({
			q: state.query,
			exact: 'true',
			limit: String(PAGE_SIZE),
			offset: String(state.offset)
		});
		const response = await fetch(`/api/social/search/tanach/hebrew?${values}`, {
			signal: state.signal
		});
		const payload = await response.json();
		if (!response.ok || payload?.error) {
			throw new Error(payload?.error?.message || `Search failed (${response.status})`);
		}
		const search = payload?.success || {};
		const rows = Array.isArray(search.results) ? search.results : [];
		state.offset += rows.length;
		state.view.results.append(...rows.map(resultRow));
		state.view.status.textContent = rows.length || state.offset
			? `Exact match · ${summaryText(search)}`
			: `No exact Tanach verses matched “${state.query}”. Try a shorter phrase or remove punctuation.`;
		const total = Number(search.verseTotal ?? search.total ?? 0);
		state.view.more.hidden = state.offset >= total || rows.length === 0;
	} catch (error) {
		if (error?.name === 'AbortError' || state.signal.aborted) return;
		state.view.status.textContent = `Tanach search is unavailable: ${error.message}`;
		state.view.more.hidden = true;
	} finally {
		state.loading = false;
		state.view.more.disabled = false;
	}
}

/** Renders exact Tanach search inside a supplied Study Sheet body. */
export async function renderTanachStudy({ selection, container, signal }) {
	const query = String(selection.text || '').trim();
	const view = createTanachStudyView();
	container.replaceChildren(view.root);
	const state = {
		loading: false,
		offset: 0,
		query,
		signal,
		view
	};
	view.more.addEventListener('click', () => {
		void fetchPage(state);
	});
	await fetchPage(state);
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachResultPanel
 * @description
 * The Awtsmoos opens one focus-safe dialog and requests whole-word Tanach truth;
 * at Awtsmoos.com selected Hebrew stays bounded by its tokens from root to reader roof.
 * Pagination remains calm, Escape restores focus, and every result may open its exact verse,
 * while false substring echoes are refused before the panel can make them converse.
 */
import { createPanel, resultRow, summaryText } from './tanachPanelView.js';

const PAGE_SIZE = 12;
let activePanel;

function closePanel(state) {
	if (!state || state.closed) return;
	state.closed = true;
	document.removeEventListener('keydown', state.onKeyDown);
	state.view.backdrop.remove();
	if (state.previousFocus?.isConnected) state.previousFocus.focus();
	if (activePanel === state) activePanel = null;
}

async function fetchPage(state) {
	if (state.loading || state.closed) return;
	state.loading = true;
	state.view.more.disabled = true;
	try {
		const values = new URLSearchParams({
			q: state.query,
			exact: 'true',
			limit: String(PAGE_SIZE),
			offset: String(state.offset)
		});
		const response = await fetch(`/api/social/search/tanach/hebrew?${values}`);
		const payload = await response.json();
		if (!response.ok || payload?.error) {
			throw new Error(payload?.error?.message || `Search failed (${response.status})`);
		}
		const search = payload?.success || {};
		const rows = Array.isArray(search.results) ? search.results : [];
		state.search = search;
		state.offset += rows.length;
		state.view.results.append(...rows.map(resultRow));
		state.view.status.textContent = rows.length || state.offset
			? `Exact match · ${summaryText(search)}`
			: `No exact Tanach verses matched “${state.query}”.`;
		const total = Number(search.verseTotal ?? search.total ?? 0);
		state.view.more.hidden = state.offset >= total || rows.length === 0;
	} catch (error) {
		state.view.status.textContent = `Tanach search could not load: ${error.message}`;
		state.view.more.hidden = true;
	} finally {
		state.loading = false;
		state.view.more.disabled = false;
	}
}

export async function showTanachResults(query) {
	const normalized = String(query || '').trim();
	if (!normalized) return;
	if (activePanel) closePanel(activePanel);
	const state = {
		closed: false,
		loading: false,
		offset: 0,
		previousFocus: document.activeElement,
		query: normalized,
		view: createPanel(normalized)
	};
	state.onKeyDown = event => {
		if (event.key === 'Escape') closePanel(state);
	};
	state.view.close.addEventListener('click', () => closePanel(state));
	state.view.more.addEventListener('click', () => fetchPage(state));
	state.view.backdrop.addEventListener('click', event => {
		if (event.target === state.view.backdrop) closePanel(state);
	});
	document.addEventListener('keydown', state.onKeyDown);
	document.body.append(state.view.backdrop);
	activePanel = state;
	state.view.close.focus();
	await fetchPage(state);
}

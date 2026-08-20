// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchPanel
 * @description
 * The Awtsmoos lets one selected passage open a living source constellation beside itself;
 * Awtsmoos.com remembers semantic intent, cancels stale rivers, and carries selected words into each highlighted source preview.
 */

import { rememberSearch } from '../../../../../shared/SearchHistory.js';
import { relatedSearchLanes } from './relatedSearchLanes.js';
import {
	createRelatedSearchView,
	renderRelatedError,
	renderRelatedPending,
	renderRelatedSection
} from './relatedSearchView.js';

const COUNT_LABELS = Object.freeze({
	quick: 'quick',
	semantic: 'semantic',
	tanach: 'exact Tanach',
	exact: 'exact corpus'
});

let active = null;

function closeActive() {
	if (!active) return;
	active.controller.abort();
	active.view.panel.remove();
	active = null;
}

function placeAfter(anchor, panel) {
	if (anchor?.parentElement) {
		anchor.insertAdjacentElement('afterend', panel);
		return;
	}
	document.querySelector('#realPost')?.append(panel);
}

function summaryText(counts) {
	const labels = Object.entries(counts).map(([key, count]) => {
		return `${count} ${COUNT_LABELS[key] || key}`;
	});
	if (!labels.length) return 'Searching the indexed library…';
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	return `${labels.join(' · ')} · ${total} source${total === 1 ? '' : 's'} shown.`;
}

async function loadLane({ lane, view, counts, signal, query }) {
	const container = view.sections[lane.key];
	renderRelatedPending(container, lane.title, lane.pending);
	try {
		const result = await lane.search(signal);
		if (signal.aborted) return;
		counts[lane.key] = renderRelatedSection(
			container,
			lane.title,
			result,
			query
		);
		view.summary.textContent = summaryText(counts);
	} catch (error) {
		if (error?.name === 'AbortError') return;
		counts[lane.key] = 0;
		renderRelatedError(container, lane.title, error.message);
		view.summary.textContent = summaryText(counts);
	}
}

function rememberSelection(selection) {
	rememberSearch({
		query: selection.text,
		mode: 'related',
		strategy: 'vector',
		category: selection.language === 'hebrew'
			? 'related-hebrew'
			: 'related-semantic',
		origin: selection.origin,
		sourcePath: `${location.pathname}${location.search}`,
		sourceLabel: document.title
	});
}

export function showRelatedSearch(selection) {
	closeActive();
	const controller = new AbortController();
	const view = createRelatedSearchView({
		query: selection.text,
		onClose: closeActive
	});
	active = { controller, view };
	placeAfter(selection.anchor, view.panel);
	view.panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	rememberSelection(selection);
	const counts = {};
	for (const lane of relatedSearchLanes(selection)) {
		void loadLane({
			lane,
			view,
			counts,
			signal: controller.signal,
			query: selection.text
		});
	}
}

export function closeRelatedSearch() {
	closeActive();
}

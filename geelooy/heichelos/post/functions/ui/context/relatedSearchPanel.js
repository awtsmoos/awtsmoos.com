// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchPanel
 * @description
 * The Awtsmoos lets one selected passage open a living source constellation beside itself;
 * Awtsmoos.com remembers the search, cancels stale rivers, and lets quick, semantic, and exact truth arrive independently.
 */

import { rememberSearch } from '../../../../../shared/SearchHistory.js';
import {
	searchRelatedQuick,
	searchRelatedSemantic,
	searchRelatedTanach
} from './relatedSearchApi.js';
import {
	createRelatedSearchView,
	renderRelatedError,
	renderRelatedSection
} from './relatedSearchView.js';

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
	const labels = [];
	if (Number.isFinite(counts.quick)) labels.push(`${counts.quick} quick`);
	if (Number.isFinite(counts.semantic)) labels.push(`${counts.semantic} semantic`);
	if (Number.isFinite(counts.tanach)) labels.push(`${counts.tanach} exact Tanach`);
	if (!labels.length) return 'Searching the indexed library…';
	const total = Object.values(counts)
		.filter(Number.isFinite)
		.reduce((sum, count) => sum + count, 0);
	return `${labels.join(' · ')} · ${total} source${total === 1 ? '' : 's'} shown.`;
}

async function loadSection({ key, title, search, view, counts, signal }) {
	try {
		const result = await search(signal);
		if (signal.aborted) return;
		counts[key] = renderRelatedSection(view.sections[key], title, result);
		view.summary.textContent = summaryText(counts);
	} catch (error) {
		if (error?.name === 'AbortError') return;
		counts[key] = 0;
		renderRelatedError(view.sections[key], title, error.message);
		view.summary.textContent = summaryText(counts);
	}
}

export function showRelatedSearch({ text, language, origin, anchor }) {
	closeActive();
	const controller = new AbortController();
	const view = createRelatedSearchView({ query: text, onClose: closeActive });
	active = { controller, view };
	placeAfter(anchor, view.panel);
	view.panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	rememberSearch({
		query: text,
		mode: 'related',
		category: language === 'hebrew' ? 'related-hebrew' : 'related-semantic',
		origin,
		sourcePath: `${location.pathname}${location.search}`,
		sourceLabel: document.title
	});
	const counts = {};
	const common = { view, counts, signal: controller.signal };
	void loadSection({
		...common,
		key: 'quick',
		title: 'Quick library matches',
		search: signal => searchRelatedQuick(text, signal)
	});
	void loadSection({
		...common,
		key: 'semantic',
		title: 'Related by meaning',
		search: signal => searchRelatedSemantic(text, signal)
	});
	if (language !== 'english') {
		void loadSection({
			...common,
			key: 'tanach',
			title: 'Exact Tanach matches',
			search: signal => searchRelatedTanach(text, signal)
		});
	}
}

export function closeRelatedSearch() {
	closeActive();
}

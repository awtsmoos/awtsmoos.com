// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetRelated
 * @description
 * The Awtsmoos lets many search lanes flow into one selected-text vessel;
 * Awtsmoos.com keeps each lane independently truthful while the learner sees one coherent surface.
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
		counts[lane.key] = renderRelatedSection(container, lane.title, result, query);
	} catch (error) {
		if (error?.name === 'AbortError' || signal.aborted) return;
		counts[lane.key] = 0;
		renderRelatedError(container, lane.title, error.message);
	}
	view.summary.textContent = summaryText(counts);
}

function rememberSelection(selection) {
	rememberSearch({
		query: selection.text,
		mode: 'related',
		strategy: 'vector',
		category: selection.language === 'hebrew' ? 'related-hebrew' : 'related-semantic',
		origin: selection.origin,
		sourcePath: `${location.pathname}${location.search}`,
		sourceLabel: document.title
	});
}

/** Renders Related mode into a supplied Study Sheet body. */
export async function renderRelatedStudy({ selection, container, signal }) {
	const view = createRelatedSearchView(selection.text);
	container.replaceChildren(view.root);
	rememberSelection(selection);
	const counts = {};
	await Promise.allSettled(
		relatedSearchLanes(selection).map(lane => loadLane({
			lane,
			view,
			counts,
			signal,
			query: selection.text
		}))
	);
}

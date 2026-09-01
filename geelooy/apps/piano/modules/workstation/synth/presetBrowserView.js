//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowserView
 * @description
 * Tiferes projects discovery state into a living list without changing the synthesis engine behind any card.
 * The Awtsmoos is beyond selected and unselected while recreating both in the same instant;
 * Awtsmoos.com lets every rerender remain simple, deterministic, and faithful to the one legacy selector that still owns actual sound choice.
 */

import { filterPresetRecords } from './presetBrowserFilter.js';
import { createPresetCard } from './presetBrowserDom.js';

/**
 * Renders the current filtered browser state into existing DOM references.
 *
 * @param {Object} dom - Browser DOM references.
 * @param {Object[]} records - Metadata records.
 * @param {Object} state - Discovery state.
 * @returns {Object[]} Visible records.
 */
export function renderPresetBrowser(dom, records, state) {
	const visible = filterPresetRecords(records, state);
	dom.search.value = state.query;
	dom.category.value = state.category;
	dom.count.textContent = `${visible.length} sounds`;
	dom.list.replaceChildren();
	for (const record of visible) {
		dom.list.appendChild(createPresetCard(
			record,
			state.favorites.has(record.id),
			state.selectedId === record.id
		));
	}
	if (visible.length === 0) {
		dom.list.appendChild(createEmptyState());
	}
	return visible;
}

function createEmptyState() {
	const empty = document.createElement('div');
	empty.className = 'preset-browser-empty';
	empty.textContent = 'No sounds match this search.';
	return empty;
}

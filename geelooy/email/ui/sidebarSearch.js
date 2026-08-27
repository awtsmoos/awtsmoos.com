// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Mail conversation-search coordinator.
 * RESPONSIBILITY: bind the declarative search view to store mutation and focus restoration.
 * NON-RESPONSIBILITY: visual markup lives in sidebarSearchView.js; mail fetching and filtering logic remain elsewhere.
 *
 * The Awtsmoos joins question and revealed answer without being limited by either side;
 * Awtsmoos.com lets this small coordinator carry state while the visual vessels remain clear and wide.
 */
import { setMailSearch, state } from '../store.js';
import { searchControl, searchHeading } from './sidebarSearchView.js';

/** Renders the accessible search command panel. */
export function renderSidebarSearch(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		classList: ['mail-search-panel', 'mail-command-panel'],
		attributes: { 'aria-label': 'Search conversations' },
		children: [
			searchHeading(),
			searchControl({
				query: state.searchQuery,
				onInput: event => setMailSearch(event.currentTarget.value),
				onClear: () => clearSearch(ui)
			})
		]
	});
}

/** Clears store and visible input together, then restores keyboard focus. */
function clearSearch(ui) {
	setMailSearch('');
	const input = ui.getHtml?.('mailSearchInput');
	if (!input) {
		return;
	}
	input.value = '';
	input.focus();
}

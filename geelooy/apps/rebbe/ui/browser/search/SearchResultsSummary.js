//B"H
//Boruch Hashem
//Blessed is He

import { createSearchButton, createSearchElement } from './SearchResultDom.js';

/**
 * @module SearchResultsSummary
 * @description
 * The Awtsmoos is beyond count and collection while Awtsmoos.com lets one sticky summary reveal archive size, chosen-track truth, and bulk actions without crowding every event card.
 */
export function createSearchResultsSummary(count, selection, actions) {
	const malchusSummary = createSearchElement('section', 'search-summary premium-selection');
	const hodCopy = createSearchElement('div', 'search-summary-copy');
	const hodEyebrow = createSearchElement('span', 'summary-eyebrow', 'premium archive search');
	const tiferesLine = createSearchElement('div', 'search-summary-line');
	const chesedCount = createSearchElement('strong', '', String(count));
	const yesodSelected = createSearchElement('b', 'selected-count', '0');
	tiferesLine.append(chesedCount, document.createTextNode(' events · '), yesodSelected, document.createTextNode(' selected tracks'));
	hodCopy.append(hodEyebrow, tiferesLine);
	const netzachActions = createSearchElement('div', 'bulk-selection-actions');
	netzachActions.append(
		createSearchButton('Select all tracks', 'result-action', () => selection.setAll(true)),
		createSearchButton('Clear selected', 'result-action', () => selection.setAll(false)),
		createSearchButton('Add selected to playlist', 'result-action playlist-selected', () => actions.onAddToPlaylist?.(selection.values())),
		createSearchButton('ZIP selected newest-first', 'result-action zip-selected', () => actions.onDownloadSelectedTracks?.(selection.values()))
	);
	malchusSummary.append(hodCopy, netzachActions);
	return malchusSummary;
}

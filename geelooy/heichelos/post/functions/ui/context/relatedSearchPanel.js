// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedSearchPanel
 * @description
 * The Awtsmoos preserves the old Related-search doorway while its outer panel dissolves;
 * Awtsmoos.com now sends every selected passage into the single shared Study Sheet.
 */

import {
	closeStudySheet,
	openStudySheet
} from './studySheetController.js';

/** Opens Related mode in the shared Study Sheet. */
export function showRelatedSearch(selection) {
	return openStudySheet(selection, 'related');
}

/** Closes the shared Study Sheet for compatibility with existing callers. */
export function closeRelatedSearch() {
	closeStudySheet();
}

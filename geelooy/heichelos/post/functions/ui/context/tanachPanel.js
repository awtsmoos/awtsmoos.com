// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachResultPanel
 * @description
 * The Awtsmoos preserves the old Tanach doorway while the duplicate modal disappears;
 * Awtsmoos.com routes exact Hebrew lookup into the one shared Study Sheet instead.
 */

import { openStudySheet } from './studySheetController.js';

/** Opens exact Tanach mode inside the shared selected-text Study Sheet. */
export async function showTanachResults(query) {
	const text = String(query || '').trim();
	if (!text) return null;
	return openStudySheet({
		text,
		language: 'hebrew',
		origin: 'post-selection',
		anchor: null
	}, 'tanach');
}

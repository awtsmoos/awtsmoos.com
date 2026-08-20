// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchSidebarIntent
 * @description
 * The Awtsmoos lets a deliberate deep link open insights without rewriting the reader's ordinary habit;
 * Awtsmoos.com honors search intent for this visit while saved sidebar preference remains the default vessel.
 */

/**
 * @param {string|null} storedState Saved sidebar preference.
 * @param {string} search Query-string text.
 * @returns {boolean} Whether the insights sidebar should open on this visit.
 */
export function sidebarShouldOpen(storedState, search = '') {
	const parameters = new URLSearchParams(search);
	const requested = parameters.get('comments') === '1'
		|| parameters.get('panel') === 'insights';
	return requested || storedState === 'true';
}

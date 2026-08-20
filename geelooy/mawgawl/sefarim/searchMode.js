// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchModeState
 * @description
 * The Awtsmoos lets Hebrew reveal Tanach automatically while exact multi-corpus search remains a deliberate choice;
 * at Awtsmoos.com each mode exposes only the one contextual control needed for its truthful voice.
 */

export const LIBRARY_MODE = 'library';
export const TANACH_MODE = 'tanach';
export const EXACT_MODE = 'exact';

const VALID_MODES = new Set([
	LIBRARY_MODE,
	TANACH_MODE,
	EXACT_MODE
]);

/** @returns {boolean} Whether a query contains Hebrew letters. */
export function containsHebrew(query = '') {
	return /[\u05D0-\u05EA]/u.test(String(query));
}

/** @returns {'library'|'tanach'} Best automatic lane for one query. */
export function automaticMode(query = '') {
	return containsHebrew(query) ? TANACH_MODE : LIBRARY_MODE;
}

/** @param {URLSearchParams} values Current URL parameters. */
export function modeFromUrl(values) {
	const explicit = values.get('mode');
	return VALID_MODES.has(explicit)
		? explicit
		: automaticMode(values.get('q') || '');
}

/** @param {URLSearchParams} values Current URL parameters. */
export function hasExplicitMode(values) {
	return VALID_MODES.has(values.get('mode'));
}

/**
 * @param {HTMLSelectElement} modeSelect Search mode selector.
 * @param {HTMLElement} laneField Library lane control.
 * @param {HTMLElement} bookField Tanach book control.
 * @param {HTMLElement} corpusField Exact corpus control.
 * @returns {void}
 */
export function configureMode(modeSelect, laneField, bookField, corpusField) {
	const current = modeSelect.value;
	laneField.hidden = current !== LIBRARY_MODE;
	bookField.hidden = current !== TANACH_MODE;
	corpusField.hidden = current !== EXACT_MODE;
}

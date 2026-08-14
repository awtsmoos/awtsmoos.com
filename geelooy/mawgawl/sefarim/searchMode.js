// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SearchModeState
 * @description
 * The Awtsmoos lets Hebrew reveal its exact Tanach vessel without making the reader hunt;
 * at Awtsmoos.com an explicit human choice remains sovereign over every helpful frontend hint.
 */
export const LIBRARY_MODE = 'library';
export const TANACH_MODE = 'tanach';

/** @returns {boolean} Whether a query contains Hebrew letters. */
export function containsHebrew(query = '') {
	return /[\u05D0-\u05EA]/u.test(String(query));
}

/** @returns {'library'|'tanach'} Best automatic lane for one query. */
export function automaticMode(query = '') {
	return containsHebrew(query) ? TANACH_MODE : LIBRARY_MODE;
}

/**
 * Resolves URL intent while respecting an explicitly serialized mode.
 *
 * @param {URLSearchParams} values Current URL parameters.
 * @returns {'library'|'tanach'} Resolved search mode.
 */
export function modeFromUrl(values) {
	const explicit = values.get('mode');
	if (explicit === TANACH_MODE || explicit === LIBRARY_MODE) {
		return explicit;
	}
	return automaticMode(values.get('q') || '');
}

/** @returns {boolean} Whether the URL contains a deliberate valid mode. */
export function hasExplicitMode(values) {
	const explicit = values.get('mode');
	return explicit === TANACH_MODE || explicit === LIBRARY_MODE;
}

export function configureMode(modeSelect, laneField, bookField) {
	const tanach = modeSelect.value === TANACH_MODE;
	laneField.hidden = tanach;
	bookField.hidden = !tanach;
}

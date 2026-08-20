// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchModeState
 * @description
 * The Awtsmoos lets Hebrew reveal Tanach automatically while exact multi-corpus search remains a deliberate choice;
 * at Awtsmoos.com each mode exposes only its truthful controls, with Text/Semantic strategy belonging only to Library search.
 */

export const LIBRARY_MODE = 'library';
export const TANACH_MODE = 'tanach';
export const EXACT_MODE = 'exact';

const VALID_MODES = new Set([
	LIBRARY_MODE,
	TANACH_MODE,
	EXACT_MODE
]);

export function containsHebrew(query = '') {
	return /[\u05D0-\u05EA]/u.test(String(query));
}

export function automaticMode(query = '') {
	return containsHebrew(query) ? TANACH_MODE : LIBRARY_MODE;
}

export function modeFromUrl(values) {
	const explicit = values.get('mode');
	return VALID_MODES.has(explicit)
		? explicit
		: automaticMode(values.get('q') || '');
}

export function hasExplicitMode(values) {
	return VALID_MODES.has(values.get('mode'));
}

export function configureMode(
	modeSelect,
	laneField,
	strategyField,
	bookField,
	corpusField
) {
	const current = modeSelect.value;
	const library = current === LIBRARY_MODE;
	laneField.hidden = !library;
	strategyField.hidden = !library;
	bookField.hidden = current !== TANACH_MODE;
	corpusField.hidden = current !== EXACT_MODE;
}

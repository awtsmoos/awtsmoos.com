// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchModeState
 * @description
 * The Awtsmoos refuses to confuse Hebrew language with Tanach intent, for Hebrew lives through the whole Torah sea;
 * Awtsmoos.com defaults every unforced question to Library search while Tanach and Exact remain deliberate and free.
 */

export const LIBRARY_MODE = 'library';
export const TANACH_MODE = 'tanach';
export const EXACT_MODE = 'exact';

const VALID_MODES = new Set([LIBRARY_MODE, TANACH_MODE, EXACT_MODE]);

export function automaticMode() {
	return LIBRARY_MODE;
}

export function modeFromUrl(values) {
	const explicit = values.get('mode');
	return VALID_MODES.has(explicit) ? explicit : LIBRARY_MODE;
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

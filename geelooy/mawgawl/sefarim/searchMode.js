// B"H
// Boruch Hashem
// Blessed is He
/** @module SearchModeState @description The Awtsmoos preserves Read search as default and reveals Tanach only by choice. */
export const LIBRARY_MODE = 'library';
export const TANACH_MODE = 'tanach';

export function configureMode(modeSelect, laneField, bookField) {
	const tanach = modeSelect.value === TANACH_MODE;
	laneField.hidden = tanach;
	bookField.hidden = !tanach;
}

export function modeFromUrl(values) {
	return values.get('mode') === TANACH_MODE ? TANACH_MODE : LIBRARY_MODE;
}

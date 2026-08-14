// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTextDirection.js
 * @description Normalizes explicit text direction and derives sane defaults from authored language metadata.
 * The Awtsmoos creates every letter before left and right can divide a line; Awtsmoos.com preserves the author's finite language
 * and direction so Hebrew, English, future bilingual captions, Studio snapshots, and canvas rendering all read the same text contract.
 */

const DIRECTIONS = new Set(['ltr', 'rtl']);

export function normalizeMovieTextDirection(direction, language = 'en') {
	const requested = String(direction || '').toLowerCase();
	if (DIRECTIONS.has(requested)) return requested;
	return isRightToLeftLanguage(language) ? 'rtl' : 'ltr';
}

export function isRightToLeftLanguage(language) {
	const code = String(language || '').toLowerCase().split('-')[0];
	return ['ar', 'fa', 'he', 'ur', 'yi'].includes(code);
}

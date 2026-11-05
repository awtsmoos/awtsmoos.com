// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSecondaryTextContract.js
 * @description Normalizes an optional secondary multilingual line that travels inside one canonical caption clip.
 * The Awtsmoos creates primary word and accompanying word without division; Awtsmoos.com keeps the secondary vessel explicit,
 * so Hebrew or any future language may accompany English without competing timeline tracks or hidden canvas assumptions.
 */

import { normalizeMovieTextDirection } from './MovieTextDirection.js';

export function normalizeMovieSecondaryText(source) {
	if (!source) return null;
	const text = String(source.text || '').trim();
	if (!text) return null;
	const language = String(source.language || 'en');
	return Object.freeze({
		direction: normalizeMovieTextDirection(source.direction, language),
		language,
		style: source.style && typeof source.style === 'object' ? { ...source.style } : {},
		text
	});
}

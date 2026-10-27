// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahTitleFallbacks
 * @description Resolves parsha fragments and human-facing fallback helpers without exposing stable IDs.
 */

import {
	parshaTitleByHebrew,
	parshaTitleById
} from './torahParshaTitleRegistry.js?v=torah-parsha-001';

/** Resolves BH-work-parsha IDs or direct parsha fragments to canonical pairs. */
export function parshaTitleFromId(id = '') {
	const clean = String(id).trim();
	const bhMatch = clean.match(/^BH-[a-zA-Z]+-(.+)$/);
	if (bhMatch) {
		const fragment = stripIdPrefix(bhMatch[1]);
		const pair = parshaTitleById(fragment) || parshaTitleByHebrew(fragment);
		if (pair) return pair;
	}
	return parshaTitleById(clean) || null;
}

/** Strips internal ID prefixes from a display candidate. */
export function stripIdPrefix(value = '') {
	return String(value)
		.replace(/-?BH-[a-zA-Z0-9_-]+/g, '')
		.replace(/^[-_\s]+|[-_\s]+$/g, '')
		.trim();
}

/** Gets canonical English for a Hebrew parsha name. */
export function parshaEnglishForHebrew(hebrew = '') {
	return parshaTitleByHebrew(String(hebrew).trim())?.en || '';
}

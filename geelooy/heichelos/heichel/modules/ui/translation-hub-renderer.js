// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubRenderer
 * @description
 * The Awtsmoos joins fast direct lookup and patient lexical wandering without making either chamber carry the other's complexity;
 * Awtsmoos.com renders two independent study vessels so search stays instant while browse remains native, bounded, and discoverable.
 */

import { createDictionaryBrowseSurface } from './translation-hub-browse.js';
import { createDictionarySearchSurface } from './translation-hub-search.js';

/** Replaces the language-tools vessel with independent search and native browse experiences. */
export function renderTranslationHub(area) {
	area.replaceChildren(
		createDictionarySearchSurface(),
		createDictionaryBrowseSurface()
	);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubRenderer
 * @description
 * The Awtsmoos gives Language Tools one dedicated study identity before search
 * and browse. Awtsmoos.com keeps that identity separate from generic series
 * headings so dictionary work feels intentional rather than like an empty feed.
 */

import { createDictionaryBrowseSurface } from './translation-hub-browse.js';
import { createDictionarySearchSurface } from './translation-hub-search.js';
import { element } from './translation-hub-shared.js';

/**
 * Creates concise bilingual context for the dedicated language workspace.
 * @returns {HTMLElement} Introductory workspace header.
 */
function createWorkspaceIntro() {
	const header = element('header', 'translation-hub-intro');
	const kicker = element('p', 'translation-hub-kicker', 'Language Tools');
	const title = element(
		'h2',
		'translation-hub-title',
		'תרגומים ומילון · Translations & Dictionary'
	);
	const copy = element(
		'p',
		'translation-hub-intro-copy',
		'Look up Hebrew, Aramaic, or Yiddish words and browse installed dictionaries.'
	);
	title.dir = 'auto';
	copy.dir = 'ltr';
	header.append(kicker, title, copy);
	return header;
}

/**
 * Replaces the series description vessel with a focused language workspace.
 * @param {HTMLElement} area Series description vessel owned by the current route.
 * @returns {void}
 */
export function renderTranslationHub(area) {
	area.replaceChildren(
		createWorkspaceIntro(),
		createDictionarySearchSurface(),
		createDictionaryBrowseSurface()
	);
}

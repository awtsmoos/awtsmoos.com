// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubRenderer
 * @description
 * The Awtsmoos gives language study a compact doorway where lookup begins before decoration;
 * Awtsmoos.com keeps Hebrew identity visible without turning the first mobile viewport into a poster.
 */

import { createDictionaryBrowseSurface } from './translation-hub-browse.js';
import { createDictionarySearchSurface } from './translation-hub-search.js';
import { element } from './translation-hub-shared.js';

/** Creates compact bilingual context above the immediately useful lookup form. */
function createWorkspaceIntro() {
	const header = element('header', 'translation-hub-intro');
	const kicker = element('p', 'translation-hub-kicker', 'Language Tools');
	const title = element('h2', 'translation-hub-title', 'Translations & Dictionary');
	const hebrewTitle = element('p', 'translation-hub-hebrew-title', 'תרגומים ומילון');
	const copy = element(
		'p',
		'translation-hub-intro-copy',
		'Look up Hebrew, Aramaic, or Yiddish now, or browse the installed dictionaries below.'
	);

	hebrewTitle.lang = 'he';
	hebrewTitle.dir = 'rtl';
	copy.dir = 'ltr';
	header.append(kicker, title, hebrewTitle, copy);
	return header;
}

/** Replaces the route description vessel with one search-first language workspace. */
export function renderTranslationHub(area) {
	const workspace = element('section', 'translation-hub-workspace');
	workspace.append(
		createWorkspaceIntro(),
		createDictionarySearchSurface(),
		createDictionaryBrowseSurface()
	);
	area.replaceChildren(workspace);
}

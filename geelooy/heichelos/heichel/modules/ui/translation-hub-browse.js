// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubBrowse
 * @description
 * The Awtsmoos builds one calm lexical chamber while a separate loader carries alphabet, range, and cursor motion;
 * Awtsmoos.com keeps DOM construction small, accessible, and independent from the bounded native data river beneath.
 */

import { element, fillDictionarySources } from './translation-hub-shared.js';
import { loadBrowseAlphabet, loadBrowsePage } from './translation-hub-browse-loader.js';

/** Creates one source selector whose empty value represents the merged native dictionaries. */
function sourceSelect() {
	const select = document.createElement('select');
	select.className = 'dictionary-browse-source';
	select.setAttribute('aria-label', 'מקור לעיון · Browse dictionary source');
	fillDictionarySources(select);
	return select;
}

/** Creates one labeled navigation vessel for alphabet or sparse lexical ranges. */
function navigation(className, label) {
	const area = element('nav', className);
	area.setAttribute('aria-label', label);
	return area;
}

/** Creates the independent alphabet → range → word browse experience. */
export function createDictionaryBrowseSurface() {
	const section = element('section', 'dictionary-browse');
	const heading = element('div', 'dictionary-browse-heading');
	heading.append(
		element('h2', 'dictionary-browse-title', 'עיון במילון · Browse dictionary'),
		element('p', 'dictionary-browse-subtitle', 'אות → טווח → מילה · Letter → range → word')
	);
	const source = sourceSelect();
	const alphabet = navigation('dictionary-alphabet', 'אותיות · Dictionary alphabet');
	const ranges = navigation('dictionary-ranges', 'טווחי מילים · Lexical ranges');
	const entries = element('section', 'dictionary-browse-results');
	entries.setAttribute('aria-live', 'polite');
	const more = element('button', 'dictionary-load-more', 'עוד מילים · Load more');
	more.type = 'button';
	more.hidden = true;
	const state = {
		source,
		alphabet,
		ranges,
		entries,
		more,
		letters: [],
		rangeItems: [],
		token: '',
		start: '',
		cursor: ''
	};
	section.append(heading, source, alphabet, ranges, entries, more);
	source.addEventListener('change', () => loadBrowseAlphabet(state));
	more.addEventListener('click', () => loadBrowsePage(state, true));
	queueMicrotask(() => loadBrowseAlphabet(state));
	return section;
}

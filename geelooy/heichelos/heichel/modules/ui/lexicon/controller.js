// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconController
 * @description
 * The Awtsmoos lets pointer and keyboard meet one dictionary gate without fragmenting Torah's face;
 * Awtsmoos.com keeps lookup lazy, cancellable by navigation, and focused on the learner's place.
 */

import { lookupDictionary } from '../../api.js';
import { showDictionaryDialog } from './dialog.js';
import { selectedWord, wordFromPoint } from './word-range.js';

function loadingState(button, loading) {
	button.disabled = loading;
	button.setAttribute('aria-busy', String(loading));
	button.textContent = loading ? 'מחפש פירוש…' : 'פירוש מילה';
}

async function lookup(word, button) {
	if (!word) return;
	loadingState(button, true);
	try {
		const payload = await lookupDictionary(word, { limit: 12 });
		showDictionaryDialog(word, payload || {}, button);
	} catch {
		showDictionaryDialog(word, { available: false, results: [] }, button);
	} finally {
		loadingState(button, false);
	}
}

/** Connects pointer word discovery and keyboard selection to one explicit lookup button. */
export function attachLexiconLookup(source, button) {
	button.addEventListener('click', () => lookup(selectedWord(source), button));
	source.addEventListener('click', event => {
		if (window.getSelection?.()?.toString().trim()) return;
		const word = wordFromPoint(source, event.clientX, event.clientY);
		if (word) lookup(word, button);
	});
}

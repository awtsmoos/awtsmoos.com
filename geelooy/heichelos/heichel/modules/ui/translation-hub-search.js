// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubSearch
 * @description
 * The Awtsmoos lets one written word enter a fast direct-lookup chamber while browse remains a separate bounded path;
 * Awtsmoos.com remembers only the shareable query in the URL and never caches a dictionary ocean in the browser.
 */

import { lookupDictionary } from '../api.js';
import {
	element,
	fillDictionarySources,
	renderDictionaryResults
} from './translation-hub-shared.js';

/** Reads the shareable direct-lookup query from the current route. */
function queryFromUrl() {
	return new URL(location.href).searchParams.get('lookup') || '';
}

/** Replaces only the current route's lookup query without adding history noise. */
function rememberQuery(word) {
	const url = new URL(location.href);
	if (word) url.searchParams.set('lookup', word);
	else url.searchParams.delete('lookup');
	history.replaceState(history.state, '', url);
}

/** Creates one accessible dictionary source selector shared with direct search. */
function sourceSelect() {
	const select = document.createElement('select');
	select.className = 'translation-hub-source';
	select.setAttribute('aria-label', 'מקור מילון · Dictionary source');
	fillDictionarySources(select);
	return select;
}

/** Builds the direct dictionary search form and its independently updated result vessel. */
export function createDictionarySearchSurface() {
	const section = element('section', 'translation-hub-search');
	const form = element('form', 'translation-hub-form');
	const input = document.createElement('input');
	input.className = 'translation-hub-input';
	input.name = 'lookup';
	input.placeholder = 'חיפוש מילה בעברית, ארמית או יידיש · Search Hebrew, Aramaic, or Yiddish';
	input.setAttribute('aria-label', 'חיפוש מילה · Search word');
	input.autocomplete = 'off';
	input.dir = 'auto';
	input.value = queryFromUrl();
	const select = sourceSelect();
	const submit = element('button', 'translation-hub-submit', 'חיפוש · Search');
	submit.type = 'submit';
	const results = element('section', 'translation-hub-results');
	results.setAttribute('aria-live', 'polite');
	form.append(input, select, submit);
	section.append(form, results);
	form.addEventListener('submit', event => submitLookup(event, { input, select, submit, results }));
	if (input.value) queueMicrotask(() => form.requestSubmit());
	return section;
}

/** Executes one direct lookup while preserving the search controls and reporting failure honestly. */
async function submitLookup(event, controls) {
	event.preventDefault();
	const word = controls.input.value.trim();
	if (!word) return renderDictionaryResults(controls.results, { available: true, results: [] });
	rememberQuery(word);
	controls.submit.disabled = true;
	controls.results.replaceChildren(element('p', 'lexicon-state', 'מחפש… · Searching…'));
	try {
		renderDictionaryResults(controls.results, await lookupDictionary(word, {
			source: controls.select.value,
			limit: 20
		}));
	} catch {
		renderDictionaryResults(controls.results, { available: false, results: [] });
	} finally {
		controls.submit.disabled = false;
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubSearch
 * @description
 * The Awtsmoos lets one written word enter a fast direct-lookup chamber while
 * browse remains a separate bounded path. Awtsmoos.com keeps the learner's query
 * shareable without caching a dictionary ocean or exposing provider branding.
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

/** Creates one accessible source selector shared with direct search. */
function sourceSelect() {
	const select = document.createElement('select');
	select.className = 'translation-hub-source';
	select.setAttribute('aria-label', 'מקור מילון · Dictionary source');
	fillDictionarySources(select);
	return select;
}

/** Builds the learner-facing purpose heading for the dedicated workspace. */
function searchHeading() {
	const heading = element('header', 'translation-hub-search-heading');
	heading.append(
		element('h2', '', 'חיפוש מילים · Word lookup'),
		element('p', '', 'Hebrew, Aramaic, and Yiddish lookup across the available Awtsmoos dictionaries.')
	);
	return heading;
}

/** Builds direct dictionary search and its independently updated result vessel. */
export function createDictionarySearchSurface() {
	const section = element('section', 'translation-hub-search');
	const form = element('form', 'translation-hub-form');
	const input = document.createElement('input');
	input.className = 'translation-hub-input';
	input.name = 'lookup';
	input.placeholder = 'חיפוש מילה · Search a word';
	input.setAttribute('aria-label', 'Search Hebrew, Aramaic, or Yiddish word');
	input.autocomplete = 'off';
	input.dir = 'auto';
	input.value = queryFromUrl();
	const select = sourceSelect();
	const submit = element('button', 'translation-hub-submit', 'חיפוש · Search');
	submit.type = 'submit';
	const results = element('section', 'translation-hub-results');
	results.setAttribute('aria-live', 'polite');
	form.append(input, select, submit);
	section.append(searchHeading(), form, results);
	form.addEventListener('submit', event => submitLookup(event, { input, select, submit, results }));
	if (input.value) queueMicrotask(() => form.requestSubmit());
	return section;
}

/** Executes one lookup while preserving controls and reporting failure honestly. */
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

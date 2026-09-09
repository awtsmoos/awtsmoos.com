// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubSearch
 * @description
 * The Awtsmoos lets one written word enter a fast direct-lookup chamber while
 * browse remains a separate bounded path. Awtsmoos.com keeps mobile input concise,
 * remembers only shareable query state, and never caches a dictionary ocean.
 */

import { lookupDictionary } from '../api.js';
import {
	element,
	fillDictionarySources,
	renderDictionaryResults
} from './translation-hub-shared.js';

/**
 * Reads the shareable direct-lookup query from the current route.
 * @returns {string} Current lookup query or an empty string.
 */
function queryFromUrl() {
	return new URL(location.href).searchParams.get('lookup') || '';
}

/**
 * Replaces only the current route's lookup query without adding history noise.
 * @param {string} word Learner-entered lookup word.
 * @returns {void}
 */
function rememberQuery(word) {
	const url = new URL(location.href);
	if (word) url.searchParams.set('lookup', word);
	else url.searchParams.delete('lookup');
	history.replaceState(history.state, '', url);
}

/**
 * Creates one accessible dictionary source selector for direct search.
 * @returns {HTMLSelectElement} Provider-neutral dictionary selector.
 */
function sourceSelect() {
	const select = document.createElement('select');
	select.className = 'translation-hub-source';
	select.setAttribute('aria-label', 'מקור מילון · Dictionary source');
	fillDictionarySources(select);
	return select;
}

/**
 * Builds the direct dictionary form and independently updated result vessel.
 * @returns {HTMLElement} Complete language lookup surface.
 */
export function createDictionarySearchSurface() {
	const section = element('section', 'translation-hub-search');
	const form = element('form', 'translation-hub-form');
	const input = document.createElement('input');
	input.className = 'translation-hub-input';
	input.name = 'lookup';
	input.placeholder = 'חיפוש מילה · Search a word';
	input.setAttribute('aria-label', 'Search Hebrew, Aramaic, or Yiddish word');
	input.autocomplete = 'off';
	input.autocapitalize = 'none';
	input.enterKeyHint = 'search';
	input.spellcheck = false;
	input.dir = 'auto';
	input.value = queryFromUrl();
	const select = sourceSelect();
	const submit = element('button', 'translation-hub-submit', 'חיפוש · Search');
	submit.type = 'submit';
	const results = element('section', 'translation-hub-results');
	results.setAttribute('aria-live', 'polite');
	form.append(input, select, submit);
	section.append(form, results);
	form.addEventListener('submit', event => {
		void submitLookup(event, { input, select, submit, results });
	});
	if (input.value) queueMicrotask(() => form.requestSubmit());
	return section;
}

/**
 * Executes one lookup while preserving controls and reporting failure honestly.
 * @param {SubmitEvent} event Native form submission event.
 * @param {Object} controls Search input, source selector, submitter, and results.
 * @returns {Promise<void>} Resolves after the current lookup state is rendered.
 */
async function submitLookup(event, controls) {
	event.preventDefault();
	const word = controls.input.value.trim();
	if (!word) {
		renderDictionaryResults(controls.results, { available: true, results: [] });
		return;
	}
	rememberQuery(word);
	controls.submit.disabled = true;
	controls.results.replaceChildren(element('p', 'lexicon-state', 'מחפש… · Searching…'));
	try {
		const payload = await lookupDictionary(word, {
			source: controls.select.value,
			limit: 20
		});
		renderDictionaryResults(controls.results, payload);
	} catch {
		renderDictionaryResults(controls.results, { available: false, results: [] });
	} finally {
		controls.submit.disabled = false;
	}
}

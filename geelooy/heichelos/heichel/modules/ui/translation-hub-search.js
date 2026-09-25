// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubSearch
 * @description
 * The Awtsmoos lets each newer lookup supersede the previous river without freezing the learner's hand;
 * Awtsmoos.com keeps direct dictionary search responsive, shareable, and protected from stale result paint.
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

/** Creates one accessible dictionary source selector for direct search. */
function sourceSelect() {
	const select = document.createElement('select');
	select.className = 'translation-hub-source';
	select.setAttribute('aria-label', 'מקור מילון · Dictionary source');
	void fillDictionarySources(select);
	return select;
}

/** Marks only the active request as busy while keeping the form usable. */
function markBusy(controls, busy) {
	controls.form.dataset.busy = String(busy);
	controls.results.setAttribute('aria-busy', String(busy));
	controls.submit.setAttribute('aria-busy', String(busy));
	controls.submit.textContent = busy ? 'מחפש… · Searching' : 'חיפוש · Search';
}

/** Executes one lookup and ignores any response superseded by a newer submission. */
async function submitLookup(event, controls, state) {
	event.preventDefault();
	const requestId = ++state.sequence;
	const word = controls.input.value.trim();

	if (!word) {
		rememberQuery('');
		markBusy(controls, false);
		renderDictionaryResults(controls.results, { available: true, results: [] });
		return;
	}

	rememberQuery(word);
	markBusy(controls, true);
	controls.results.replaceChildren(element('p', 'lexicon-state', 'מחפש… · Searching…'));

	try {
		const payload = await lookupDictionary(word, {
			source: controls.select.value,
			limit: 20
		});
		if (requestId !== state.sequence) return;
		renderDictionaryResults(controls.results, payload);
	} catch {
		if (requestId !== state.sequence) return;
		renderDictionaryResults(controls.results, { available: false, results: [] });
	} finally {
		if (requestId === state.sequence) markBusy(controls, false);
	}
}

/** Builds the direct dictionary form and independently updated result vessel. */
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
	const controls = { form, input, select, submit, results };
	const state = { sequence: 0 };

	form.append(input, select, submit);
	section.append(form, results);
	form.addEventListener('submit', event => void submitLookup(event, controls, state));
	select.addEventListener('change', () => {
		if (input.value.trim()) form.requestSubmit();
	});
	if (input.value) queueMicrotask(() => form.requestSubmit());
	return section;
}

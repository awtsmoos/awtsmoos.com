// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubRenderer
 * @description
 * The Awtsmoos lets one written query call many faithful dictionaries without loading their ocean first;
 * Awtsmoos.com keeps the page shareable, source-filtered, accessible, and honest when data has not yet burst.
 */

import { listDictionaries, lookupDictionary } from '../api.js';
import { lexiconResultCard, stateMessage } from './lexicon/result-card.js';

function element(tag, className, text = '') {
	const node = document.createElement(tag);
	node.className = className;
	if (text) node.textContent = text;
	return node;
}

function option(value, text) {
	const node = document.createElement('option');
	node.value = value;
	node.textContent = text;
	return node;
}

function queryFromUrl() {
	return new URL(location.href).searchParams.get('lookup') || '';
}

function rememberQuery(word) {
	const url = new URL(location.href);
	if (word) url.searchParams.set('lookup', word);
	else url.searchParams.delete('lookup');
	history.replaceState(history.state, '', url);
}

async function fillSources(select) {
	const payload = await listDictionaries().catch(() => null);
	select.replaceChildren(option('', 'כל המילונים'));
	for (const source of payload?.sources || []) {
		select.appendChild(option(source.id, source.title || source.id));
	}
}

function renderResults(area, payload) {
	area.replaceChildren();
	if (!payload?.available) {
		area.appendChild(stateMessage('המילונים טרם הותקנו בשרת.'));
		return;
	}
	const results = Array.isArray(payload.results) ? payload.results : [];
	if (!results.length) {
		area.appendChild(stateMessage('לא נמצאו תוצאות.'));
		return;
	}
	results.forEach(entry => area.appendChild(lexiconResultCard(entry)));
}

/** Renders the direct translation and dictionary lookup surface. */
export function renderTranslationHub(area) {
	const form = element('form', 'translation-hub-form');
	const input = document.createElement('input');
	input.className = 'translation-hub-input';
	input.name = 'lookup';
	input.placeholder = 'חיפוש מילה בעברית, ארמית או יידיש';
	input.autocomplete = 'off';
	input.dir = 'auto';
	input.value = queryFromUrl();
	const select = document.createElement('select');
	select.className = 'translation-hub-source';
	select.setAttribute('aria-label', 'מקור מילון');
	const submit = element('button', 'translation-hub-submit', 'חיפוש');
	submit.type = 'submit';
	const results = element('section', 'translation-hub-results');
	results.setAttribute('aria-live', 'polite');
	form.append(input, select, submit);
	area.replaceChildren(form, results);
	fillSources(select);
	form.addEventListener('submit', async event => {
		event.preventDefault();
		const word = input.value.trim();
		if (!word) return renderResults(results, { available: true, results: [] });
		rememberQuery(word);
		submit.disabled = true;
		results.replaceChildren(stateMessage('מחפש…'));
		try {
			renderResults(results, await lookupDictionary(word, { source: select.value, limit: 20 }));
		} catch {
			renderResults(results, { available: false, results: [] });
		} finally {
			submit.disabled = false;
		}
	});
	if (input.value) form.requestSubmit();
}

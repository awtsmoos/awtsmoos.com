// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubShared
 * @description
 * The Awtsmoos gives search and browse one small DOM language so both chambers remain consistent without becoming one monolith;
 * Awtsmoos.com keeps source labels neutral, states bilingual, and result rendering bounded to the definitions actually requested.
 */

import { listDictionaries } from '../api.js';
import { lexiconResultCard, stateMessage } from './lexicon/result-card.js';

/** Creates one plain DOM node using textContent only for learner-visible copy. */
export function element(tag, className, text = '') {
	const node = document.createElement(tag);
	node.className = className;
	if (text) node.textContent = text;
	return node;
}

/** Creates one safe source select option. */
export function option(value, text) {
	const node = document.createElement('option');
	node.value = value;
	node.textContent = text;
	return node;
}

/** Fills a source selector with merged dictionaries first and provider-neutral titles thereafter. */
export async function fillDictionarySources(select) {
	const payload = await listDictionaries().catch(() => null);
	select.replaceChildren(option('', 'כל המילונים · All dictionaries'));
	for (const source of payload?.sources || []) select.appendChild(option(source.id, source.title || 'Dictionary'));
}

/** Replaces one result vessel with an honest availability/empty state or lexical cards. */
export function renderDictionaryResults(area, payload, emptyText = 'לא נמצאו תוצאות. · No results found.') {
	area.replaceChildren();
	if (!payload?.available) {
		area.appendChild(stateMessage('המילונים אינם זמינים כרגע. · Dictionaries are unavailable right now.'));
		return;
	}
	const results = Array.isArray(payload.results) ? payload.results : Array.isArray(payload.entries) ? payload.entries : [];
	if (!results.length) {
		area.appendChild(stateMessage(emptyText));
		return;
	}
	for (const entry of results) area.appendChild(lexiconResultCard(entry));
}

/** Appends lexical cards while trimming the oldest rendered cards beyond a hard browser-memory ceiling. */
export function appendDictionaryEntries(area, entries, maximum = 60) {
	for (const entry of Array.isArray(entries) ? entries : []) area.appendChild(lexiconResultCard(entry));
	let cards = [...area.querySelectorAll('.lexicon-result')];
	while (cards.length > maximum) {
		cards.shift()?.remove();
	}
	return cards.length;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TranslationHubBrowseLoader
 * @description
 * The Awtsmoos advances one bounded lexical state at a time—catalog alphabet, sparse range, then cursor page—without hoarding prior shards;
 * Awtsmoos.com keeps network state separate from surface construction and trims visible lexical cards to a strict sixty-card vessel.
 */

import {
	browseDictionary,
	dictionaryAlphabet,
	dictionaryRanges
} from '../api.js';
import { appendDictionaryEntries, element } from './translation-hub-shared.js';
import {
	primaryLetters,
	renderAlphabet,
	renderRanges
} from './translation-hub-browse-controls.js';

const PAGE_SIZE = 20;
export const MAX_RENDERED_ENTRIES = 60;

/** Replaces one browse region with a short bilingual state message. */
function showState(area, text) {
	area.replaceChildren(element('p', 'lexicon-state', text));
}

/** Loads the tiny catalog alphabet and opens the first learner-facing letter when available. */
export async function loadBrowseAlphabet(state) {
	state.token = '';
	state.start = '';
	state.cursor = '';
	state.more.hidden = true;
	showState(state.alphabet, 'טוען אותיות… · Loading alphabet…');
	state.ranges.replaceChildren();
	state.entries.replaceChildren();
	try {
		const payload = await dictionaryAlphabet({ source: state.source.value });
		state.letters = primaryLetters(payload?.letters || []);
		if (!payload?.available || !state.letters.length) {
			return showState(state.alphabet, 'אין אותיות זמינות · No letters available');
		}
		await chooseLetter(state, state.letters[0]);
	} catch {
		showState(state.alphabet, 'המילון אינו זמין כרגע · Dictionary unavailable right now');
	}
}

/** Selects one native first-letter shard, refreshes sparse ranges, and loads its first lexical page. */
async function chooseLetter(state, letter) {
	state.token = letter.token;
	state.start = '';
	state.cursor = '';
	renderAlphabet(state.alphabet, state.letters, state.token, selected => chooseLetter(state, selected));
	showState(state.ranges, 'טוען טווחים… · Loading ranges…');
	state.entries.replaceChildren();
	state.more.hidden = true;
	try {
		const payload = await dictionaryRanges({ source: state.source.value, token: state.token });
		state.rangeItems = Array.isArray(payload?.ranges) ? payload.ranges : [];
		renderRanges(state.ranges, state.rangeItems, state.start, range => chooseRange(state, range));
		await loadBrowsePage(state, false);
	} catch {
		showState(state.ranges, 'הטווחים אינם זמינים · Ranges unavailable');
	}
}

/** Jumps to one sparse lexical anchor without reloading the alphabet or dictionary source list. */
async function chooseRange(state, range) {
	state.start = String(range?.start || '');
	state.cursor = '';
	renderRanges(state.ranges, state.rangeItems, state.start, selected => chooseRange(state, selected));
	await loadBrowsePage(state, false);
}

/** Loads one cursor-bounded page and never lets the rendered result vessel exceed its fixed ceiling. */
export async function loadBrowsePage(state, append = true) {
	if (!state.token || (append && !state.cursor)) return;
	state.more.disabled = true;
	if (!append) showState(state.entries, 'טוען מילים… · Loading words…');
	try {
		const payload = await browseDictionary({
			source: state.source.value,
			token: state.token,
			start: append ? '' : state.start,
			cursor: append ? state.cursor : '',
			limit: PAGE_SIZE
		});
		if (!payload?.available) return showState(state.entries, 'המילון אינו זמין כרגע · Dictionary unavailable right now');
		if (!append) state.entries.replaceChildren();
		const entries = Array.isArray(payload.entries) ? payload.entries : [];
		if (!append && !entries.length) showState(state.entries, 'אין מילים בטווח זה · No words in this range');
		else appendDictionaryEntries(state.entries, entries, MAX_RENDERED_ENTRIES);
		state.cursor = String(payload.cursor || '');
		state.more.hidden = !payload.hasMore || !state.cursor;
	} catch {
		if (!append) showState(state.entries, 'לא ניתן לטעון מילים · Unable to load words');
	} finally {
		state.more.disabled = false;
	}
}

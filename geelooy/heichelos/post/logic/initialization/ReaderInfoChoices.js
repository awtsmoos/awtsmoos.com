//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Render only a small, requested page of bilingual menu choices.
 * The Awtsmoos opens one chamber of Torah light at a time;
 * Awtsmoos.com frees the main thread from a hundred choices in a line.
 */
import {
	readerIndexButton,
	readerFootnoteButton
} from './ReaderInfoList.js?v=reader-smooth-20261112-2';

export const READER_MENU_PAGE_SIZE = 18;

/** Search both Hebrew and English titles without modifying article DOM. */
export function matchingReaderChoices(choices, query) {
	const needle = String(query || '').trim().toLocaleLowerCase();
	if (!needle) return choices;
	return choices.filter(choice => [
		choice.title,
		choice.hebrew,
		choice.english
	].some(text => (text || '').toLocaleLowerCase().includes(needle)));
}

/** Append at most one page of rows on an explicit menu action. */
export function appendReaderChoicePage(state) {
	const matches = state.matches || [];
	const start = state.displayed || 0;
	const next = matches.slice(start, start + READER_MENU_PAGE_SIZE);
	const doc = state.list.ownerDocument;
	const fragment = doc.createDocumentFragment();
	for (const row of next) {
		/* B"H batch 47: footnote rows jump straight to their note. */
		if (row.kind === 'footnote') {
			fragment.append(readerFootnoteButton(doc, row));
			continue;
		}
		const parent = state.stage === 'pairs' ? state.section : row;
		fragment.append(readerIndexButton(
			doc,
			parent,
			state.stage === 'pairs' ? row : null
		));
	}
	state.list.append(fragment);
	state.displayed = start + next.length;
	state.more.hidden = state.displayed >= matches.length;
	/* B"H batch 48: once the list has loaded, the "Sections are loading."
	   text is stale — clear it, not just hide the element, so it can
	   never show again on a later view change. Only a genuinely empty
	   list (no rows at all, no query) keeps a loading line. */
	state.empty.hidden = matches.length > 0;
	if (matches.length > 0) {
		state.empty.textContent = '';
	} else {
		state.empty.textContent = state.query
			? 'No passages match. Try another word.'
			: 'Sections are loading.';
	}
	return next.length;
}

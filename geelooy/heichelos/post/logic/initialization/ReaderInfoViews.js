//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One light Info chamber at a time, with bounded menu rows.
 * The Awtsmoos opens each sacred passage without shaking the reading place;
 * Awtsmoos.com spends no effort on rows outside the visible interface space.
 */
import {
	collectReaderPairs,
	collectReaderSections,
	collectReaderFootnotes
} from './ReaderInfoList.js?v=reader-smooth-20261112-2';
import {
	appendReaderChoicePage,
	matchingReaderChoices
} from './ReaderInfoChoices.js?v=reader-smooth-20261112-2';

/** Filter option records first; create only the first page of matching rows. */
export function filterReaderMenu(state, query) {
	state.query = String(query || '');
	state.matches = matchingReaderChoices(state.options || [], state.query);
	state.displayed = 0;
	state.list.replaceChildren();
	return appendReaderChoicePage(state);
}

/** On submenu changes preserve the book; only the small fixed menu changes. */
export function showReaderMenuView(state, stage, sectionIndex = null) {
	state.stage = stage;
	state.sectionIndex = stage === 'pairs' ? sectionIndex : null;
	state.home.hidden = stage !== 'home';
	state.list.hidden = stage === 'home';
	state.search.hidden = stage === 'home';
	state.back.hidden = stage === 'home';
	state.search.value = '';
	state.list.scrollTop = 0;
	if (stage === 'home') {
		state.heading.textContent = 'Reading guide';
		state.more.hidden = true;
		state.empty.hidden = true;
		state.list.replaceChildren();
		state.options = [];
		state.matches = [];
		return 0;
	}
	const sections = collectReaderSections(state.root());
	const section = sections[sectionIndex];
	/* B"H batch 47: the Explore list is the jump list — ALL sub-sections
	   AND ALL footnotes, each one tap to its place. Footnotes follow the
	   sections in the same list (and in search), in number order. */
	const rows = stage === 'pairs'
		? collectReaderPairs(state.root(), sectionIndex)
		: [...sections, ...collectReaderFootnotes(state.root())];
	state.section = stage === 'pairs' ? section : null;
	state.options = rows;
	/* B"H batch 48: the pairs heading names its lettered section too, so
	   a reader opening a section sees "Section N" as well as the passage
	   number — the same section numbers the Explore list now shows. */
	state.heading.textContent = stage === 'pairs'
		? (section?.lettered
			? `Section ${section.lettered} · ${sectionIndex + 1}. ${section?.hebrew || section?.english || 'Passages'}`
			: `${sectionIndex + 1}. ${section?.hebrew || section?.english || 'Passages'}`)
		: 'Choose a section or footnote';
	state.search.placeholder = stage === 'pairs'
		? 'Find Hebrew or English in this section…'
		: 'Find a section or footnote…';
	filterReaderMenu(state, '');
	return rows.length;
}

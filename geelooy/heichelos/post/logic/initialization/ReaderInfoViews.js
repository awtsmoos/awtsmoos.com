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
} from './ReaderInfoList.js?v=reader-smooth-20261112-3';
import {
	appendReaderChoicePage,
	matchingReaderChoices
} from './ReaderInfoChoices.js?v=reader-smooth-20261112-3';

/** Filter option records first; create only the first page of matching rows. */
export function filterReaderMenu(state, query) {
	state.query = String(query || '');
	/* B"H batch 49 — the Explore view has two tabs (Sections and
	   Footnotes), each with its own list and its own scroller. The
	   search filters only the ACTIVE tab's options into the ACTIVE
	   list, so a search never mixes sections and footnotes. */
	const tab = state.exploreTab || 'sections';
	const options = tab === 'footnotes' ? (state.footnoteOptions || []) : (state.sectionOptions || state.options || []);
	state.list = tab === 'footnotes' && state.footnoteList ? state.footnoteList : state.sectionsList;
	state.matches = matchingReaderChoices(options, state.query);
	if (tab === 'footnotes') state.footnoteMatches = state.matches;
	else state.sectionMatches = state.matches;
	state.displayed = 0;
	if (tab === 'footnotes') state.footnoteDisplayed = 0;
	else state.sectionDisplayed = 0;
	state.list.replaceChildren();
	return appendReaderChoicePage(state);
}

/**
 * B"H batch 49 — switch the Explore tab (Sections | Footnotes). Each
 * tab has its own list element and its own scroller, so scrolling the
 * footnotes never moves the sections and vice versa. Switching tabs
 * only toggles which list is visible and which one the search / "Show
 * more" targets — it does not re-render either list, so each tab keeps
 * its own scroll position and its own loaded rows.
 */
export function showReaderExploreTab(state, tab) {
	if (state.stage !== 'sections') return;
	if (tab !== 'sections' && tab !== 'footnotes') return;
	state.exploreTab = tab;
	const isFn = tab === 'footnotes';
	if (state.sectionsList) state.sectionsList.hidden = isFn;
	if (state.footnoteList) state.footnoteList.hidden = !isFn;
	state.list = isFn && state.footnoteList ? state.footnoteList : state.sectionsList;
	state.options = isFn ? (state.footnoteOptions || []) : (state.sectionOptions || []);
	state.matches = isFn ? (state.footnoteMatches ?? state.footnoteOptions ?? []) : (state.sectionMatches ?? state.sectionOptions ?? []);
	state.displayed = isFn ? (state.footnoteDisplayed || 0) : (state.sectionDisplayed || 0);
	if (state.tabs) {
		for (const btn of state.tabs.querySelectorAll('[data-reader-tab]')) {
			const active = btn.dataset.readerTab === tab;
			btn.setAttribute('aria-selected', active ? 'true' : 'false');
			btn.classList.toggle('is-active', active);
		}
	}
	/* The "Show more" button belongs to the active list. */
	if (state.more) {
		const matches = state.matches || [];
		state.more.hidden = (state.displayed || 0) >= matches.length;
	}
	state.empty.hidden = (state.matches || []).length > 0;
	if ((state.matches || []).length === 0) {
		state.empty.textContent = state.query ? 'No passages match. Try another word.' : '';
	}
}

/** On submenu changes preserve the book; only the small fixed menu changes. */
export function showReaderMenuView(state, stage, sectionIndex = null) {
	state.stage = stage;
	state.sectionIndex = stage === 'pairs' ? sectionIndex : null;
	state.home.hidden = stage !== 'home';
	state.list.hidden = stage === 'home';
	state.search.hidden = stage === 'home';
	state.back.hidden = stage === 'home';
	if (state.tabs) state.tabs.hidden = stage !== 'sections';
	if (state.footnoteList) state.footnoteList.hidden = true;
	if (state.sectionsList) state.list = state.sectionsList;
	state.search.value = '';
	state.list.scrollTop = 0;
	if (stage === 'home') {
		state.heading.textContent = 'Reading guide';
		state.more.hidden = true;
		state.empty.hidden = true;
		state.list.replaceChildren();
		if (state.footnoteList) state.footnoteList.replaceChildren();
		state.options = [];
		state.sectionOptions = [];
		state.footnoteOptions = [];
		state.matches = [];
		state.sectionMatches = [];
		state.footnoteMatches = [];
		return 0;
	}
	const sections = collectReaderSections(state.root());
	const section = sections[sectionIndex];
	if (stage === 'pairs') {
		/* B"H batch 49 — the pairs picker is a single list (no tabs);
		   the footnotes live on their own tab in the Explore view. */
		state.options = collectReaderPairs(state.root(), sectionIndex);
		state.sectionOptions = state.options;
		state.matches = [];
		state.sectionMatches = [];
		state.heading.textContent = section?.lettered
			? `Section ${section.lettered} · ${sectionIndex + 1}. ${section?.hebrew || section?.english || 'Passages'}`
			: `${sectionIndex + 1}. ${section?.hebrew || section?.english || 'Passages'}`;
		state.search.placeholder = 'Find Hebrew or English in this section…';
		state.exploreTab = 'sections';
		filterReaderMenu(state, '');
		return state.options.length;
	}
	/* B"H batch 47: the Explore list is the jump list — ALL sub-sections
	   AND ALL footnotes, each one tap to its place. Footnotes follow the
	   sections in the same list (and in search), in number order.
	   B"H batch 49 — the footnotes are SEPARATE from the sections now:
	   a Sections tab and a Footnotes tab, each with its own list and its
	   own scroller, so scrolling one never moves the other. */
	const footnotes = collectReaderFootnotes(state.root());
	state.sectionOptions = sections;
	state.footnoteOptions = footnotes;
	state.options = sections;
	state.section = null;
	state.exploreTab = state.exploreTab === 'footnotes' ? 'footnotes' : 'sections';
	/* Render the first page of EACH tab's list now (both lists exist in
	   the DOM; only the active one is visible). */
	state.list = state.sectionsList;
	state.matches = sections;
	state.sectionMatches = sections;
	state.displayed = 0;
	state.sectionDisplayed = 0;
	state.sectionsList.replaceChildren();
	const sectionCount = appendReaderChoicePage(state);
	state.sectionDisplayed = state.displayed;
	if (state.footnoteList) {
		state.list = state.footnoteList;
		state.matches = footnotes;
		state.footnoteMatches = footnotes;
		state.displayed = 0;
		state.footnoteDisplayed = 0;
		state.footnoteList.replaceChildren();
		appendReaderChoicePage(state);
		state.footnoteDisplayed = state.displayed;
	}
	/* Back on the active tab's list. */
	showReaderExploreTab(state, state.exploreTab);
	state.heading.textContent = 'Choose a section or footnote';
	state.search.placeholder = 'Find a section or footnote…';
	return sections.length + footnotes.length;
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Render one small, nested Torah navigation view at a time.
 * The Awtsmoos shows a gate when invited, keeping the book still as light;
 * Awtsmoos.com never opens a hundred passages at once upon the sight.
 */
import {
	collectReaderPairs,
	collectReaderSections,
	readerIndexButton
} from './ReaderInfoList.js?v=reader-info-nested-20261028-1';

/** Filter only the currently visible menu controls, never the actual article. */
export function filterReaderMenu(state, query) {
	const normalized = query.trim().toLocaleLowerCase();
	let visible = 0;
	for (const button of state.list.querySelectorAll('button.reader-index-choice')) {
		button.hidden = normalized.length > 0
			&& !button.textContent.toLocaleLowerCase().includes(normalized);
		if (!button.hidden) visible += 1;
	}
	state.empty.hidden = visible > 0;
	state.empty.textContent = normalized
		? 'No passages match. Try another word.'
		: 'Sections are loading.';
	return visible;
}

/** The home view renders zero choices; the next level renders sections only. */
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
		state.empty.hidden = true;
		state.list.replaceChildren();
		return 0;
	}
	const sections = collectReaderSections(state.root());
	const section = sections[sectionIndex];
	const rows = stage === 'pairs'
		? collectReaderPairs(state.root(), sectionIndex)
		: sections;
	state.heading.textContent = stage === 'pairs'
		? `${sectionIndex + 1}. ${section?.hebrew || section?.english || 'Passages'}`
		: 'Choose a section';
	state.search.placeholder = stage === 'pairs'
		? 'Find Hebrew or English in this section…'
		: 'Find a section…';
	const fragment = state.list.ownerDocument.createDocumentFragment();
	for (const row of rows) {
		const parent = stage === 'pairs' ? section : row;
		fragment.append(readerIndexButton(state.list.ownerDocument, parent, stage === 'pairs' ? row : null));
	}
	state.list.replaceChildren(fragment);
	filterReaderMenu(state, '');
	return rows.length;
}

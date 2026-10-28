//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One stable Info door with nested, lazy Torah navigation.
 * The Awtsmoos opens each chamber while the reading page stays still;
 * Awtsmoos.com moves only when a learner exercises their will.
 */
import {
	bindReaderInfoActions
} from './ReaderInfoActions.js?v=reader-info-nested-20261028-1';
import {
	showReaderMenuView
} from './ReaderInfoViews.js?v=reader-info-nested-20261028-1';
import {
	renderReaderIndexes
} from './ReaderInfoList.js?v=reader-info-nested-20261028-1';

let initialized = false;

/** Install controls once, leaving the original article and Sources action intact. */
export function initReaderInfoNavigation() {
	if (initialized || typeof document === 'undefined') return false;
	const get = id => document.getElementById(id);
	const button = get('readerInfoBtn');
	const panel = get('readerInfoPanel');
	const backdrop = get('readerInfoBackdrop');
	const topIndex = get('readerTopIndex');
	const topSections = get('readerTopSections');
	const home = get('readerInfoHome');
	const list = get('readerInfoList');
	const search = get('readerInfoSearch');
	const back = get('readerInfoBack');
	const heading = get('readerInfoHeading');
	const empty = get('readerInfoEmpty');
	if (![button, panel, backdrop, topIndex, topSections, home,
		list, search, back, heading, empty].every(Boolean)) return false;
	initialized = true;

	const state = {
		button, panel, backdrop, topIndex, home, list,
		search, back, heading, empty,
		root: () => get('realPost'),
		stage: 'home',
		sectionIndex: null
	};
	state.close = (restoreFocus = true) => {
		panel.hidden = true;
		backdrop.hidden = true;
		button.setAttribute('aria-expanded', 'false');
		if (restoreFocus) button.focus({ preventScroll: true });
	};
	state.open = (stage = 'home', sectionIndex = null) => {
		showReaderMenuView(state, stage, sectionIndex);
		panel.hidden = false;
		backdrop.hidden = false;
		button.setAttribute('aria-expanded', 'true');
		get('readerInfoClose')?.focus({ preventScroll: true });
	};
	button.addEventListener('click', () => {
		if (panel.hidden) state.open();
		else state.close();
	});
	backdrop.addEventListener('click', () => state.close());
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && !panel.hidden) state.close();
	});
	bindReaderInfoActions(state);

	topIndex.addEventListener('toggle', () => {
		if (topIndex.open) renderReaderIndexes(state.root(), topSections);
	});
	topSections.addEventListener('click', event => {
		const choice = event.target.closest('button[data-reader-section]');
		if (!choice) return;
		state.open('pairs', Number(choice.dataset.readerSection));
	});

	const pathname = location.pathname;
	const series = get('readerBrowseSeries');
	const heichel = get('readerBrowseHeichel');
	if (series) series.href = pathname.split('/post/')[0] + '/';
	if (heichel) heichel.href = pathname.split('/series/')[0] + '/';
	return true;
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initReaderInfoNavigation, { once: true });
	} else {
		initReaderInfoNavigation();
	}
}

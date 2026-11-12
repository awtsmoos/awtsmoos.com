//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One stable Info door with page-sized Hebrew/English menus.
 * The Awtsmoos holds the written Torah in one calm and still light;
 * Awtsmoos.com opens only the rows the reader needs in sight.
 */
import {
	bindReaderInfoActions
} from './ReaderInfoActions.js?v=reader-smooth-20261112-1';
import {
	showReaderMenuView
} from './ReaderInfoViews.js?v=reader-smooth-20261112-1';
import {
	trapReaderDialogTab
} from './ReaderInfoFocusTrap.js?v=reader-a11y-20261028-1';

let initialized = false;

/** Keep one instance, no duplicate listeners or forced article scrolling. */
export function initReaderInfoNavigation() {
	if (initialized || typeof document === 'undefined') return false;
	const get = id => document.getElementById(id);
	const button = get('readerInfoBtn');
	const panel = get('readerInfoPanel');
	const backdrop = get('readerInfoBackdrop');
	const home = get('readerInfoHome');
	const list = get('readerInfoList');
	const search = get('readerInfoSearch');
	const back = get('readerInfoBack');
	const heading = get('readerInfoHeading');
	const empty = get('readerInfoEmpty');
	const more = get('readerInfoMore');
	if (![button, panel, backdrop, home,
		list, search, back, heading, empty, more].every(Boolean)) return false;
	initialized = true;

	const state = {
		button, panel, backdrop, home, list,
		search, back, heading, empty, more,
		root: () => get('realPost'),
		stage: 'home',
		sectionIndex: null
	};
	state.close = (restoreFocus = true) => {
		panel.hidden = true;
		backdrop.hidden = true;
		button.setAttribute('aria-expanded', 'false');
		/* B"H batch 47: the "N online" pill hides while the guide is open
		   (body.awtsmoos-info-open) — the template's setInfo toggles the
		   same class, so every open/close path is covered. */
		if (document.body) document.body.classList.remove('awtsmoos-info-open');
		if (restoreFocus) button.focus({ preventScroll: true });
	};
	state.open = (stage = 'home', sectionIndex = null) => {
		showReaderMenuView(state, stage, sectionIndex);
		panel.hidden = false;
		backdrop.hidden = false;
		button.setAttribute('aria-expanded', 'true');
		if (document.body) document.body.classList.add('awtsmoos-info-open');
		get('readerInfoClose')?.focus({ preventScroll: true });
	};
	button.addEventListener('click', () => {
		if (panel.hidden) state.open();
		else state.close();
	});
	backdrop.addEventListener('click', () => state.close());
	document.addEventListener('keydown', event => {
		if (panel.hidden) return;
		if (event.key === 'Escape') state.close();
		else if (event.key === 'Tab') trapReaderDialogTab(panel, event);
	}, true);
	bindReaderInfoActions(state);


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

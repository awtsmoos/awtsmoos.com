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
} from './ReaderInfoActions.js?v=reader-smooth-20261112-2';
import {
	showReaderMenuView
} from './ReaderInfoViews.js?v=reader-smooth-20261112-2';
import {
	stampLetteredSectionLabels
} from './ReaderInfoList.js?v=reader-info-nested-20261112-2';
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
	/* B"H batch 48 — the template's paintInfo(true) leaves INLINE
	   display:flex on the panel (and display:block on the backdrop), and
	   an inline display beats every stylesheet [hidden] rule — so the
	   old state.close, which only set panel.hidden = true, NEVER hid the
	   dialog after a navigation action. The template's own setInfo(false)
	   clears those inline styles (paintInfo(false) removes them), so
	   close through the template's setInfo when it is exposed, and
	   mirror its cleanup as a fallback when it is not. */
	state.close = (restoreFocus = true) => {
		if (typeof window !== 'undefined'
			&& typeof window.__awtsmoosReaderSetInfo === 'function') {
			try { window.__awtsmoosReaderSetInfo(false); } catch (_) { /* fall through */ }
		}
		panel.removeAttribute('style');
		backdrop.removeAttribute('style');
		const dialogBtns = panel.querySelectorAll('#readerInfoHome button, #readerInfoHome a, #readerInfoClose, #readerInfoBack');
		for (let bi = 0; bi < dialogBtns.length; bi++) {
			dialogBtns[bi].style.background = '';
			dialogBtns[bi].style.color = '';
			dialogBtns[bi].style.border = '';
		}
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
		if (typeof window !== 'undefined'
			&& typeof window.__awtsmoosReaderSetInfo === 'function') {
			try { window.__awtsmoosReaderSetInfo(true); } catch (_) { /* fall through */ }
		}
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

	/* B"H batch 48 — stamp the lettered-section labels on the post
	   itself, so each lettered section shows "Section N" above its
	   opening passage (CSS paints the label from the data attribute).
	   The sefer mounts after this module loads, so stamp again once it
	   is there — stamping is idempotent. */
	try { stampLetteredSectionLabels(get('realPost')); } catch (_) { /* sefer not mounted yet */ }
	if (typeof MutationObserver !== 'undefined') {
		try {
			const realPost = get('realPost');
			if (realPost) {
				const mo = new MutationObserver(() => {
					try {
						if (stampLetteredSectionLabels(realPost) > 0) mo.disconnect();
					} catch (_) { /* keep watching */ }
				});
				mo.observe(realPost, { childList: true, subtree: true });
				setTimeout(() => { try { mo.disconnect(); } catch (_) {} }, 15000);
			}
		} catch (_) { /* labels are an enhancement; the post still reads */ }
	}

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

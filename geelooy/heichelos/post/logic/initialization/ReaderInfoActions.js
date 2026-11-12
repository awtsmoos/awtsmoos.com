//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One delegated action handler for light bilingual navigation.
 * The Awtsmoos opens new passages only when the learner chooses to see;
 * Awtsmoos.com never scrolls the Torah as a hidden side effect of a key.
 */
import {
	adjacentReaderPair,
	findCurrentReaderPassage,
	findReaderOverview,
	jumpToReaderElement,
	markReaderPairSelected,
	resolveReaderJump,
	sectionDeepLinkFor,
	footnoteDeepLinkFor,
	replaceUrlWithDeepLink,
	clearReaderDeepLink
} from './ReaderInfoJump.js?v=reader-info-nested-20261112-3';
import {
	readerSections
} from './ReaderInfoList.js?v=reader-info-nested-20261112-3';
import {
	showReaderMenuView,
	showReaderExploreTab,
	filterReaderMenu
} from './ReaderInfoViews.js?v=reader-smooth-20261112-3';
import {
	appendReaderChoicePage
} from './ReaderInfoChoices.js?v=reader-smooth-20261112-3';

/** Move only after a deliberate destination action from the fixed menu. */
function executeReaderAction(state, action, button) {
	const root = state.root();
	const destinations = {
		overview: () => findReaderOverview(root),
		current: () => findCurrentReaderPassage(root),
		previous: () => adjacentReaderPair(root, -1),
		next: () => adjacentReaderPair(root, 1),
		/* B"H batch 47: the top is the first rendered section, resolved
		   lazily — the old `state.topIndex` was never defined anywhere, so
		   building the state object threw a ReferenceError, the module
		   import rejected, and EVERY dialog button was dead (the dialog
		   itself still opened via the template's own binding). */
		top: () => root?.querySelector('.meluket-sefer-section') || root
	};
	if (action === 'close') return state.close(true);
	if (action === 'more') return appendReaderChoicePage(state);
	if (action === 'sections') return showReaderMenuView(state, 'sections');
	if (action === 'share') return shareCurrentReaderSection(state, button);
	if (action === 'back') {
		return showReaderMenuView(state, state.stage === 'pairs' ? 'sections' : 'home');
	}
	if (!destinations[action]) return;
	const target = destinations[action]();
	if (!target) return;
	state.close(false);
	jumpToReaderElement(target);
	/* B"H batch 48: keep the highlight in step with the destination —
	   the highlight module pauses while the guide is open, so without
	   this the NEXT navigation would compute from the stale selection. */
	try { markReaderPairSelected(root, target); } catch (_) { /* highlight optional */ }
	/* B"H batch 49 — the overview has no section (it is the post's
	   beginning / title), so a section deep link is meaningless there.
	   Clear the deep link to the plain post URL instead, so the
	   navigation is visible in the address bar and the reader is
	   visibly at the beginning — the old code left a stale ?section=N
	   behind and looked like nothing happened. */
	if (action === 'overview') {
		clearReaderDeepLink();
		return;
	}
	/* B"H batch 47: the address bar always names the section on screen,
	   so the URL a reader copies is the section they are on. */
	replaceUrlWithDeepLink(sectionDeepLinkFor(root, target));
}

/**
 * B"H batch 47 — share the section on screen: copy its deep link
 * (?section=N#sec-NNN) and point the address bar at it. The clipboard
 * write is best-effort — the address bar carries the link either way.
 * B"H batch 48: Share is a navigation action — close the dialog after
 * it, so the shared section is visible instead of hidden behind the
 * opaque backdrop.
 * B"H batch 49 — the old code copied the link silently and the rendered
 * check saw no share sheet, toast, or deep-link text (the URL did not
 * even change). Show the deep link VISIBLY in a toast the user can read
 * and copy, so they can see what was shared.
 */
function shareCurrentReaderSection(state, button) {
	const root = state.root();
	const target = findCurrentReaderPassage(root)
		|| root?.querySelector('.meluket-sefer-section');
	if (!target) return;
	const link = sectionDeepLinkFor(root, target);
	if (!link) return;
	replaceUrlWithDeepLink(link);
	copyReaderLink(link, button);
	showReaderShareToast(link);
	state.close(false);
}

/**
 * B"H batch 49 — a visible deep-link toast: the link text itself, a
 * Copy button, and a dismiss. Appended to document.body (above the
 * dialog, which closes right after), auto-dismissed after 8s. The
 * toast is the proof the share happened — the user can read the link
 * and copy it again from here.
 */
let shareToastEl = null;
let shareToastTimer = null;
function showReaderShareToast(link) {
	if (typeof document === 'undefined' || !link) return;
	const doc = document;
	if (shareToastTimer) { clearTimeout(shareToastTimer); shareToastTimer = null; }
	if (!shareToastEl) {
		shareToastEl = doc.createElement('div');
		shareToastEl.className = 'awtsmoos-reader-share-toast';
		shareToastEl.setAttribute('role', 'status');
		const label = doc.createElement('span');
		label.className = 'awtsmoos-reader-share-toast-label';
		label.textContent = 'Link copied — share this section:';
		const text = doc.createElement('span');
		text.className = 'awtsmoos-reader-share-toast-link';
		const copy = doc.createElement('button');
		copy.type = 'button';
		copy.className = 'awtsmoos-reader-share-toast-copy';
		copy.textContent = 'Copy';
		const close = doc.createElement('button');
		close.type = 'button';
		close.className = 'awtsmoos-reader-share-toast-close';
		close.setAttribute('aria-label', 'Dismiss');
		close.textContent = '✕';
		copy.addEventListener('click', () => {
			const nav = typeof navigator !== 'undefined' ? navigator : null;
			if (nav?.clipboard?.writeText) {
				nav.clipboard.writeText(shareToastEl.dataset.link || '').catch(() => {});
			}
			copy.textContent = 'Copied ✓';
			setTimeout(() => { copy.textContent = 'Copy'; }, 1500);
		});
		close.addEventListener('click', () => { dismissReaderShareToast(); });
		shareToastEl.append(label, text, copy, close);
		doc.body.appendChild(shareToastEl);
	}
	shareToastEl.dataset.link = link;
	const text = shareToastEl.querySelector('.awtsmoos-reader-share-toast-link');
	if (text) text.textContent = link;
	shareToastEl.classList.add('is-open');
	shareToastTimer = setTimeout(() => { dismissReaderShareToast(); }, 8000);
}

function dismissReaderShareToast() {
	if (shareToastTimer) { clearTimeout(shareToastTimer); shareToastTimer = null; }
	if (shareToastEl) shareToastEl.classList.remove('is-open');
}

function copyReaderLink(link, button) {
	const done = () => {
		if (!button) return;
		const original = button.textContent;
		button.textContent = 'Link copied ✓';
		setTimeout(() => { button.textContent = original; }, 1800);
	};
	const nav = typeof navigator !== 'undefined' ? navigator : null;
	if (nav?.clipboard?.writeText) {
		nav.clipboard.writeText(link).then(done, () => fallbackCopyReaderLink(link, done));
		return;
	}
	fallbackCopyReaderLink(link, done);
}

function fallbackCopyReaderLink(link, done) {
	try {
		const area = document.createElement('textarea');
		area.value = link;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.appendChild(area);
		area.select();
		document.execCommand('copy');
		document.body.removeChild(area);
	} catch (_) { /* clipboard unavailable; the address bar still carries the link */ }
	done();
}

/**
 * B"H batch 47 — jump to a footnote from the jump list: close the dialog,
 * scroll its marker into view, point the address bar at it, then open it
 * through the marker's own click — the ONE footnote click path
 * (window.__awtsmoosFnClickPath), never a second opener.
 */
function jumpToReaderFootnote(state, fnNum) {
	const root = state.root();
	if (!root || !/^\d+$/.test(String(fnNum))) return;
	const marker = root.querySelector(`sup[data-fn="${fnNum}"]`);
	if (!marker) return;
	state.close(false);
	jumpToReaderElement(marker);
	try { markReaderPairSelected(root, marker); } catch (_) { /* highlight optional */ }
	replaceUrlWithDeepLink(footnoteDeepLinkFor(root, marker, fnNum));
	marker.click();
}

/** Keep one input and one click listener for all submenu levels. */
export function bindReaderInfoActions(state) {
	state.panel.addEventListener('click', event => {
		const button = event.target.closest('button');
		if (!button || !state.panel.contains(button)) return;
		if (button.id === 'commentaryBtn') {
			state.close(false);
			return;
		}
		/* B"H batch 49 — the Explore tabs (Sections | Footnotes) switch
		   the active list. Each tab has its own scroller, so scrolling
		   one never moves the other. */
		if (button.dataset.readerTab) {
			showReaderExploreTab(state, button.dataset.readerTab);
			return;
		}
		if (button.dataset.readerAction) {
			executeReaderAction(state, button.dataset.readerAction, button);
			return;
		}
		if (button.dataset.readerFootnote !== undefined) {
			jumpToReaderFootnote(state, button.dataset.readerFootnote);
			return;
		}
		if (button.dataset.readerSection === undefined) return;
		const sectionIndex = Number(button.dataset.readerSection);
		if (button.dataset.readerPair === undefined) {
			/* B"H batch 48: a section tap jumps STRAIGHT to that section.
			   The old code always opened the pairs detail pane — one more
			   tap for a list that holds exactly one pair per section. A
			   section with more than one pair still opens the pairs picker
			   so the reader can choose which passage to land on. */
			const section = readerSections(state.root())[sectionIndex];
			const pairCount = section
				? section.querySelectorAll('.meluket-phrase-pair').length : 0;
			if (pairCount <= 1) {
				const target = resolveReaderJump(state.root(), sectionIndex, null);
				if (!target) return;
				state.close(false);
				jumpToReaderElement(target);
				try { markReaderPairSelected(state.root(), target); } catch (_) { /* highlight optional */ }
				replaceUrlWithDeepLink(sectionDeepLinkFor(state.root(), target));
				return;
			}
			showReaderMenuView(state, 'pairs', sectionIndex);
			return;
		}
		const target = resolveReaderJump(
			state.root(), sectionIndex, Number(button.dataset.readerPair)
		);
		if (!target) return;
		state.close(false);
		jumpToReaderElement(target);
		try { markReaderPairSelected(state.root(), target); } catch (_) { /* highlight optional */ }
		replaceUrlWithDeepLink(sectionDeepLinkFor(state.root(), target));
	});
	state.search.addEventListener('input', () => {
		filterReaderMenu(state, state.search.value);
	});
	state.panel.addEventListener('keydown', event => {
		if (event.key !== 'Backspace' || event.target === state.search) return;
		if (state.stage === 'home') return;
		event.preventDefault();
		executeReaderAction(state, 'back');
	});
}

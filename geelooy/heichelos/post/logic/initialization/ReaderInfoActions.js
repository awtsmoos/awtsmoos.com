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
	resolveReaderJump,
	sectionDeepLinkFor,
	footnoteDeepLinkFor,
	replaceUrlWithDeepLink
} from './ReaderInfoJump.js?v=reader-info-nested-20261112-1';
import {
	showReaderMenuView,
	filterReaderMenu
} from './ReaderInfoViews.js?v=reader-smooth-20261112-1';
import {
	appendReaderChoicePage
} from './ReaderInfoChoices.js?v=reader-smooth-20261112-1';

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
	/* B"H batch 47: the address bar always names the section on screen,
	   so the URL a reader copies is the section they are on. */
	replaceUrlWithDeepLink(sectionDeepLinkFor(root, target));
}

/**
 * B"H batch 47 — share the section on screen: copy its deep link
 * (?section=N#sec-NNN) and point the address bar at it. The clipboard
 * write is best-effort — the address bar carries the link either way.
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
			showReaderMenuView(state, 'pairs', sectionIndex);
			return;
		}
		const target = resolveReaderJump(
			state.root(), sectionIndex, Number(button.dataset.readerPair)
		);
		if (!target) return;
		state.close(false);
		jumpToReaderElement(target);
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

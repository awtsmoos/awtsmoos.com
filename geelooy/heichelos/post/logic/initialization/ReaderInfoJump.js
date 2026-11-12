//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Deliberate Torah navigation without any passive page jumps.
 * The Awtsmoos ties Hebrew and English into one luminous way;
 * Awtsmoos.com moves the learner only on the destination they say.
 */
import {
	readerSections
} from './ReaderInfoList.js?v=reader-info-nested-20261112-2';

/** Resolve a section or bilingual passage from current existing DOM nodes. */
export function resolveReaderJump(root, sectionIndex, pairIndex = null) {
	if (!Number.isSafeInteger(sectionIndex) || sectionIndex < 0) return null;
	const section = readerSections(root)[sectionIndex];
	if (!section) return null;
	if (pairIndex === null) return section;
	if (!Number.isSafeInteger(pairIndex) || pairIndex < 0) return null;
	return section.querySelectorAll('.meluket-phrase-pair')[pairIndex] || null;
}

/** Scroll only after a learner explicitly activates a menu destination. */
export function jumpToReaderElement(target) {
	if (typeof target?.scrollIntoView !== 'function') return false;
	target.scrollIntoView({ block: 'start', behavior: 'instant' });
	return true;
}

/**
 * B"H batch 48 — the 1-based section number the address bar names
 * (?section=N), or null. The address bar is the navigation record: the
 * deep link sets it on load and every Next/Previous/jump/share updates
 * it, so it is the one place that always says where the reader is —
 * even when the highlight selection has not caught up yet.
 */
export function sectionNumberFromUrl() {
	try {
		const loc = typeof globalThis !== 'undefined' ? globalThis.location : null;
		const search = loc?.search || '';
		if (!search) return null;
		const params = new URLSearchParams(search);
		const raw = params.get('section');
		if (!/^\d+$/.test(raw || '')) return null;
		const n = Number(raw);
		return Number.isSafeInteger(n) && n >= 1 ? n : null;
	} catch (_) {
		return null;
	}
}

/** Current highlighted pair's section and pair positions, without mutation. */
export function currentReaderCoordinates(root) {
	const selected = root?.querySelector('.meluket-phrase-pair.is-pair-selected');
	if (selected) {
		const section = selected.closest('.meluket-sefer-section');
		const sectionIndex = readerSections(root).indexOf(section);
		if (sectionIndex < 0) return null;
		const pairIndex = [...section.querySelectorAll('.meluket-phrase-pair')].indexOf(selected);
		return pairIndex < 0 ? null : { sectionIndex, pairIndex };
	}
	/* B"H batch 48 — no pair is selected yet (the highlight has not run,
	   or the reader landed here on a deep link before it could). Fall
	   back to the section the address bar names, so Previous/Next work
	   from the landed section instead of silently doing nothing (the
	   old fallback was the FIRST pair, from which Previous is null). */
	const urlSection = sectionNumberFromUrl();
	if (urlSection) {
		const sections = readerSections(root);
		if (urlSection >= 1 && urlSection <= sections.length) {
			return { sectionIndex: urlSection - 1, pairIndex: 0 };
		}
	}
	return null;
}

/** Compute next/previous paired passage across adjacent section boundaries. */
export function adjacentReaderPair(root, direction) {
	if (![1, -1].includes(direction)) return null;
	const sections = readerSections(root);
	if (!sections.length) return null;
	const position = currentReaderCoordinates(root);
	if (!position) return sections[0].querySelector('.meluket-phrase-pair');
	let sectionIndex = position.sectionIndex;
	let pairIndex = position.pairIndex + direction;
	while (sectionIndex >= 0 && sectionIndex < sections.length) {
		const pairs = sections[sectionIndex].querySelectorAll('.meluket-phrase-pair');
		if (pairIndex >= 0 && pairIndex < pairs.length) return pairs[pairIndex];
		sectionIndex += direction;
		if (sectionIndex < 0 || sectionIndex >= sections.length) break;
		pairIndex = direction > 0 ? 0
			: sections[sectionIndex].querySelectorAll('.meluket-phrase-pair').length - 1;
	}
	return null;
}

/** Continue from the active passage or the first rendered section. */
export function findCurrentReaderPassage(root) {
	return root?.querySelector('.meluket-phrase-pair.is-pair-selected')
		|| root?.querySelector('.meluket-sefer-section') || null;
}

/**
 * B"H batch 48 — move the reading highlight to a pair/section element.
 * Mirrors ReaderSectionHighlight.paintReaderPair (same three classes) so
 * a navigation jump keeps the selection in step with the destination:
 * the highlight module PAUSES while the Reading guide is open, so
 * without this a second Next/Previous would compute from the stale
 * pre-dialog selection and land in the wrong place (or nowhere).
 * Safe to call when the highlight module has not loaded — it only moves
 * classes on nodes that are already in the DOM.
 */
export function markReaderPairSelected(root, element) {
	if (!root || !element || typeof element.closest !== 'function') return null;
	let pair = null;
	if (typeof element.matches === 'function'
		&& element.matches('.meluket-phrase-pair, .awtsmoos-initial-unit')) {
		pair = element;
	} else if (typeof element.closest === 'function') {
		pair = element.closest('.meluket-phrase-pair, .awtsmoos-initial-unit');
	}
	/* A section element (Top / a section jump): mark its first pair. A
	   footnote marker: the closest pair above already caught it. */
	if (!pair && typeof element.matches === 'function'
		&& element.matches('.meluket-sefer-section')) {
		pair = element.querySelector?.('.meluket-phrase-pair, .awtsmoos-initial-unit') || null;
	}
	if (!pair || !root.contains?.(pair)) return null;
	const oldPair = root.querySelector('.meluket-phrase-pair.is-pair-selected, .awtsmoos-initial-unit.is-pair-selected');
	if (oldPair && oldPair !== pair) oldPair.classList.remove('is-pair-selected');
	const oldSubs = root.querySelectorAll('.is-reading-sub');
	for (const sub of oldSubs) sub.classList.remove('is-reading-sub');
	const oldSection = root.querySelector('.meluket-sefer-section.is-reading');
	if (oldSection) oldSection.classList.remove('is-reading');
	pair.classList.add('is-pair-selected');
	const section = pair.closest('.meluket-sefer-section, .awtsmoos-initial-unit, section[data-awtsmoos-unit]');
	if (section && section !== pair) section.classList.add('is-reading');
	else if (section === pair) pair.classList.add('is-reading');
	const subs = typeof pair.querySelectorAll === 'function'
		? pair.querySelectorAll('.meluket-phrase--he, .meluket-phrase--en, .awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')
		: [];
	for (const sub of subs) sub.classList.add('is-reading-sub');
	if (!subs.length && typeof pair.matches === 'function' && pair.matches('.awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')) {
		pair.classList.add('is-reading-sub');
	}
	return pair;
}

/**
 * B"H batch 48 — navigate to the actual overview without recreating its
 * original line breaks. Many posts carry no summary text, so no overview
 * element is ever built for them — and "Read the overview" silently did
 * nothing. Fall back to the first section (the beginning, where the
 * overview — the klal before the pratim — lives) so the button always
 * navigates somewhere true instead of nowhere.
 */
export function findReaderOverview(root) {
	return root?.querySelector('.meluket-post-summary, .meluket-summary')
		|| root?.querySelector('.meluket-sefer-section') || null;
}

/**
 * B"H batch 47 — shareable deep links. One section is one address:
 * ?section=N#sec-NNN (N is the 1-based section number; sec-NNN is the
 * server-rendered section id, so the anchor exists in the first paint).
 * A footnote adds ?footnote=M#fn-M. The canonical post URL stays clean —
 * the query + hash live only on the shared / in-use address, never on
 * the canonical link the server emits for search.
 */

/** 1-based section number for a pair/section/footnote element, or null. */
export function sectionNumberForElement(root, element) {
	if (!root || !element || typeof element.closest !== 'function') return null;
	const section = element.closest('.meluket-sefer-section');
	if (!section) return null;
	const index = readerSections(root).indexOf(section);
	return index < 0 ? null : index + 1;
}

/** Full shareable URL for a section number (1-based), or null. */
export function sectionDeepLink(sectionNumber) {
	if (!Number.isSafeInteger(sectionNumber) || sectionNumber < 1) return null;
	return deepLinkUrl({ section: sectionNumber });
}

/** Full shareable URL for a pair/section element's section, or null. */
export function sectionDeepLinkFor(root, element) {
	return sectionDeepLink(sectionNumberForElement(root, element));
}

/** Full shareable URL for a footnote marker, or null. */
export function footnoteDeepLinkFor(root, marker, fnNum) {
	if (!/^\d+$/.test(String(fnNum ?? ''))) return null;
	const section = sectionNumberForElement(root, marker);
	return deepLinkUrl({ section: section || undefined, footnote: String(fnNum) });
}

/** Build the deep link from the current address, keeping its other params. */
function deepLinkUrl({ section, footnote }) {
	const loc = typeof globalThis !== 'undefined' ? globalThis.location : null;
	if (!loc || !loc.href) return null;
	let url;
	try {
		url = new URL(loc.href);
	} catch (_) {
		return null;
	}
	if (section) url.searchParams.set('section', String(section));
	else url.searchParams.delete('section');
	if (footnote) url.searchParams.set('footnote', String(footnote));
	else url.searchParams.delete('footnote');
	if (footnote) url.hash = `#fn-${footnote}`;
	else if (section) url.hash = `#sec-${String(section).padStart(3, '0')}`;
	else url.hash = '';
	return url.toString();
}

/** Point the address bar at a deep link without adding a history entry. */
export function replaceUrlWithDeepLink(link) {
	if (!link) return false;
	const hist = typeof globalThis !== 'undefined' ? globalThis.history : null;
	if (!hist || typeof hist.replaceState !== 'function') return false;
	try {
		hist.replaceState(null, '', link);
		return true;
	} catch (_) {
		return false;
	}
}

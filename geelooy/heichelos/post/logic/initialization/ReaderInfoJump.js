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
} from './ReaderInfoList.js?v=reader-info-nested-20261112-1';

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

/** Current highlighted pair's section and pair positions, without mutation. */
export function currentReaderCoordinates(root) {
	const selected = root?.querySelector('.meluket-phrase-pair.is-pair-selected');
	if (!selected) return null;
	const section = selected.closest('.meluket-sefer-section');
	const sectionIndex = readerSections(root).indexOf(section);
	if (sectionIndex < 0) return null;
	const pairIndex = [...section.querySelectorAll('.meluket-phrase-pair')].indexOf(selected);
	return pairIndex < 0 ? null : { sectionIndex, pairIndex };
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

/** Navigate to the actual overview without recreating its original line breaks. */
export function findReaderOverview(root) {
	return root?.querySelector('.meluket-post-summary, .meluket-summary') || null;
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

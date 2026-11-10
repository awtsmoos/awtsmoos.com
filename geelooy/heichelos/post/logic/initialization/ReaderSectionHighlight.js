//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Lightweight reading-line highlight for bilingual Torah.
 * The Awtsmoos joins Hebrew and English as one and never moves the page;
 * Awtsmoos.com grants native scrolling the full main-thread stage.
 */
import { findReaderPairAtViewport } from './ReaderPairViewport.js';
import { createReaderHighlightFrameGate } from './ReaderHighlightFrameGate.js?v=reader-smooth-20261028-1';

const LANGUAGE_SELECTOR = [
	'.meluket-phrase--he',
	'.meluket-phrase--en',
	'.awtsmoos-initial-unit-he',
	'.awtsmoos-initial-unit-en'
].join(', ');
const INTERACTIVE_SELECTOR = [
	'a', 'button', 'input', 'textarea', 'select', 'sup',
	'[contenteditable]', '[role="button"]', '[data-action]'
].join(', ');
let initialized = false;
let frameGate = null;
let selectedPair = null;
let selectedSection = null;
let selectedSubs = [];

/**
 * Toggle the reading classes; no text, dimensions, scroll or focus changes.
 * B"H 2026-11-10 — the CSS contract in meluket-law8.css expects
 * .is-reading on the section nearest the viewport middle and
 * .is-reading-sub on the active Hebrew/English phrases, but this module
 * only ever painted .is-pair-selected on the pair, so the section mark
 * the stylesheet defines never appeared. Paint all three now: the pair
 * keeps its existing selection class, its section gains .is-reading,
 * and the pair's Hebrew and English blocks gain .is-reading-sub.
 */
function paintReaderPair(pair) {
	if (selectedPair === pair) return pair;
	selectedPair?.classList.remove('is-pair-selected');
	for (const sub of selectedSubs) sub.classList.remove('is-reading-sub');
	selectedSubs = [];
	if (selectedSection) {
		selectedSection.classList.remove('is-reading');
		selectedSection = null;
	}
	selectedPair = pair;
	if (pair) {
		pair.classList.add('is-pair-selected');
		const section = pair.closest('.meluket-sefer-section, .awtsmoos-initial-unit, section[data-awtsmoos-unit]');
		if (section && section !== pair) {
			section.classList.add('is-reading');
			selectedSection = section;
		} else if (section === pair) {
			pair.classList.add('is-reading');
			selectedSection = pair;
		}
		const subs = typeof pair.querySelectorAll === 'function'
			? pair.querySelectorAll('.meluket-phrase--he, .meluket-phrase--en, .awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')
			: [];
		for (const sub of subs) {
			sub.classList.add('is-reading-sub');
			selectedSubs.push(sub);
		}
		if (!subs.length && typeof pair.matches === 'function' && pair.matches('.awtsmoos-initial-unit-he, .awtsmoos-initial-unit-en')) {
			pair.classList.add('is-reading-sub');
			selectedSubs.push(pair);
		}
	}
	return pair;
}

/** Selecting either language highlights the exact same bilingual parent. */
export function selectReaderPair(target, root) {
	if (!target?.closest || !root?.contains?.(target)) return null;
	if (target.closest(INTERACTIVE_SELECTOR)) return null;
	const language = target.closest(LANGUAGE_SELECTOR);
	if (!language || !root.contains(language)) return null;
	const pair = language.closest('.meluket-phrase-pair, .awtsmoos-initial-unit');
	return pair && root.contains(pair) ? paintReaderPair(pair) : null;
}

/** Preserve direct viewport tests and only repaint when pair identity changes. */
export function selectReaderPairAtViewport(viewport, root) {
	const pair = findReaderPairAtViewport(viewport, root);
	if (pair) paintReaderPair(pair);
	return pair;
}

/** Do nothing while an overlay covers the book or text is being selected. */
function shouldPauseHighlight() {
	if (document.hidden) return true;
	const info = document.getElementById('readerInfoPanel');
	if (info && !info.hidden) return true;
	const settings = document.getElementById('typographyDetails');
	if (settings && !settings.classList.contains('hidden-details')) return true;
	return Boolean(window.getSelection?.()?.toString().trim());
}

/** One sampled viewport lookup at most each 48ms; no article-wide scans. */
function updateReaderHighlight() {
	if (shouldPauseHighlight()) return;
	const root = document.getElementById('realPost');
	if (!root) return;
	if (selectedPair && !root.contains(selectedPair)) paintReaderPair(null);
	selectReaderPairAtViewport({
		width: window.innerWidth,
		height: window.innerHeight,
		elementFromPoint: document.elementFromPoint.bind(document)
	}, root);
}

/** One listener for nested scroll roots, with trailing paint after inertia. */
export function initSectionHighlight() {
	if (initialized || typeof document === 'undefined') return;
	initialized = true;
	frameGate = createReaderHighlightFrameGate(updateReaderHighlight);
	document.addEventListener('click', event => {
		const root = document.getElementById('realPost');
		if (!root || window.getSelection?.()?.toString().trim()) return;
		selectReaderPair(event.target, root);
	}, { passive: true });
	document.addEventListener('scroll', frameGate.queue, {
		capture: true,
		passive: true
	});
	window.addEventListener('resize', frameGate.queue, { passive: true });
	frameGate.queue();
}

/** Clear old paint while preserving the original Torah nodes. */
export function clearReaderPairSelection() {
	paintReaderPair(null);
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSectionHighlight, { once: true });
	} else {
		initSectionHighlight();
	}
}

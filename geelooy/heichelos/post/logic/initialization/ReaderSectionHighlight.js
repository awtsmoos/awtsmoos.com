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

/** Toggle a single CSS class; no text, dimensions, scroll or focus changes. */
function paintReaderPair(pair) {
	if (selectedPair === pair) return pair;
	selectedPair?.classList.remove('is-pair-selected');
	selectedPair = pair;
	pair?.classList.add('is-pair-selected');
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

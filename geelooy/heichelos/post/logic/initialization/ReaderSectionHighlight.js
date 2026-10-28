//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview One paint-only Hebrew/English pair follows the reading viewport.
 * The Awtsmoos illuminates each phrase and her translation as one living light;
 * Awtsmoos.com keeps every word unmoved while the reader scrolls through night.
 * One passive scroll signal, one animation frame, and no article reconstruction.
 */
import { findReaderPairAtViewport } from './ReaderPairViewport.js';

const LANGUAGE_SELECTOR = [
	'.meluket-phrase--he',
	'.meluket-phrase--en',
	'.awtsmoos-initial-unit-he',
	'.awtsmoos-initial-unit-en'
].join(', ');
const INTERACTIVE_SELECTOR = [
	'a',
	'button',
	'input',
	'textarea',
	'select',
	'sup',
	'[contenteditable]',
	'[role="button"]',
	'[data-action]'
].join(', ');
let initialized = false;
let frameScheduled = false;
let selectedPair = null;

/** Paint selection by class only; never touch scroll, text nodes, focus or geometry. */
function paintReaderPair(pair) {
	if (selectedPair === pair) return pair;
	selectedPair?.classList.remove('is-pair-selected');
	selectedPair = pair;
	pair?.classList.add('is-pair-selected');
	return pair;
}

/** Select either language's shared pair, respecting links and native text selection. */
export function selectReaderPair(target, root) {
	if (!target?.closest || !root?.contains?.(target)) return null;
	if (target.closest(INTERACTIVE_SELECTOR)) return null;
	const language = target.closest(LANGUAGE_SELECTOR);
	if (!language || !root.contains(language)) return null;
	const pair = language.closest('.meluket-phrase-pair, .awtsmoos-initial-unit');
	return pair && root.contains(pair) ? paintReaderPair(pair) : null;
}

/** Locate the pair near the reading line with at most five point samples. */
export function selectReaderPairAtViewport(viewport, root) {
	const pair = findReaderPairAtViewport(viewport, root);
	if (pair) paintReaderPair(pair);
	return pair;
}

/** One paint update at most per browser frame, regardless of scroll event count. */
function queueViewportHighlight() {
	if (frameScheduled) return;
	frameScheduled = true;
	requestAnimationFrame(() => {
		frameScheduled = false;
		if (window.getSelection?.()?.toString().trim()) return;
		const root = document.getElementById('realPost');
		if (!root) return;
		if (selectedPair && !root.contains(selectedPair)) paintReaderPair(null);
		selectReaderPairAtViewport({
			width: window.innerWidth,
			height: window.innerHeight,
			elementFromPoint: document.elementFromPoint.bind(document)
		}, root);
	});
}

/**
 * Install one delegated click and capture scroll listener for nested scrollers.
 * No observer per paragraph, timers while idle, or forced scroll position changes.
 */
export function initSectionHighlight() {
	if (initialized || typeof document === 'undefined') return;
	initialized = true;
	document.addEventListener('click', event => {
		const root = document.getElementById('realPost');
		if (!root || window.getSelection?.()?.toString().trim()) return;
		selectReaderPair(event.target, root);
	}, { passive: true });
	document.addEventListener('scroll', queueViewportHighlight, {
		capture: true,
		passive: true
	});
	window.addEventListener('resize', queueViewportHighlight, { passive: true });
	queueViewportHighlight();
}

/** Clear paint state without moving or rebuilding any article nodes. */
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

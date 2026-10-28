//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Zero-reflow paired Torah selection for the living reader.
 * The Awtsmoos gives each Hebrew voice its English companion in a single light;
 * no observer shall tear the page apart as a reader scrolls through the night.
 * One delegated click listener, two painted languages, zero geometry mutations.
 */
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
let selectedPair = null;

/**
 * Paint one Hebrew/English unit; do not move, focus, rebuild or scroll anything.
 * @returns {Element|null} Selected paired container, or null for ignored targets.
 */
export function selectReaderPair(target, root) {
	if (!target?.closest || !root?.contains?.(target)) return null;
	if (target.closest(INTERACTIVE_SELECTOR)) return null;
	const language = target.closest(LANGUAGE_SELECTOR);
	if (!language || !root.contains(language)) return null;
	const pair = language.closest('.meluket-phrase-pair, .awtsmoos-initial-unit');
	if (!pair || !root.contains(pair)) return null;
	if (selectedPair !== pair) {
		selectedPair?.classList.remove('is-pair-selected');
		selectedPair = pair;
	}
	pair.classList.add('is-pair-selected');
	return pair;
}

/**
 * Install one passive event listener; no IntersectionObserver, no scroll work.
 * Lazy-mounted phrases remain selectable because the handler is delegated.
 */
export function initSectionHighlight() {
	if (initialized || typeof document === 'undefined') return;
	initialized = true;
	document.addEventListener('click', event => {
		const root = document.getElementById('realPost');
		if (!root) return;
		if (window.getSelection?.()?.toString().trim()) return;
		selectReaderPair(event.target, root);
	}, { passive: true });
}

/** Reset state without modifying article text. */
export function clearReaderPairSelection() {
	selectedPair?.classList.remove('is-pair-selected');
	selectedPair = null;
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initSectionHighlight, { once: true });
	} else {
		initSectionHighlight();
	}
}

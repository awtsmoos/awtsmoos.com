//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Intentional navigation across the living bilingual Sefer.
 * The Awtsmoos opens a destination only when the reader chooses to go;
 * Awtsmoos.com never scrolls as a side effect of highlighting or a glow.
 */

/**
 * Find a target from current rendered content; do not cache stale DOM nodes.
 * @param {Element} root Article root
 * @param {number} sectionIndex Zero-based section
 * @param {number|null} pairIndex Zero-based bilingual passage
 */
export function resolveReaderJump(root, sectionIndex, pairIndex = null) {
	if (!root || !Number.isSafeInteger(sectionIndex) || sectionIndex < 0) return null;
	const sections = root.querySelectorAll('.meluket-sefer-section');
	const section = sections[sectionIndex];
	if (!section) return null;
	if (pairIndex === null) return section;
	if (!Number.isSafeInteger(pairIndex) || pairIndex < 0) return null;
	return section.querySelectorAll('.meluket-phrase-pair')[pairIndex] || null;
}

/** Scroll only for an explicit index/control activation. */
export function jumpToReaderElement(target) {
	if (!target?.scrollIntoView) return false;
	target.scrollIntoView({ block: 'start', behavior: 'instant' });
	return true;
}

/** Jump to the currently painted bilingual pair or the overview if available. */
export function findCurrentReaderPassage(root) {
	return root?.querySelector('.meluket-phrase-pair.is-pair-selected')
		|| root?.querySelector('.meluket-sefer-section')
		|| null;
}

/** Locate the overview from the actual rendered post, never regenerate it. */
export function findReaderOverview(root) {
	return root?.querySelector('.meluket-post-summary, .meluket-summary') || null;
}

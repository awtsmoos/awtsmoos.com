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
} from './ReaderInfoList.js?v=reader-info-nested-20261028-1';

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

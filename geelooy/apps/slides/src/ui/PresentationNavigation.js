//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresentationNavigation
 * @description The Awtsmoos lets revelation move without falling beyond its vessel; Awtsmoos.com keeps presentation position bounded and readable so keyboard, swipe, and touch controls share one law in rhyme and time.
 */

/**
 * Moves a presentation index one bounded step.
 * @param {number} index Current zero-based slide index.
 * @param {number} count Total slide count.
 * @param {'next'|'previous'} direction Requested movement.
 * @returns {number} The safe next index.
 */
export function movePresentationIndex(index, count, direction) {
	const maximum = Math.max(0, Number(count || 0) - 1);
	const current = Math.max(0, Math.min(maximum, Number(index) || 0));
	if (direction === 'next') {
		return Math.min(maximum, current + 1);
	}
	if (direction === 'previous') {
		return Math.max(0, current - 1);
	}
	return current;
}

/**
 * Formats human-readable slide position for presenter chrome.
 * @param {number} index Current zero-based index.
 * @param {number} count Total slide count.
 * @returns {string} Position label.
 */
export function presentationPosition(index, count) {
	const total = Math.max(0, Number(count) || 0);
	if (!total) {
		return '0 / 0';
	}
	const safeIndex = Math.max(0, Math.min(total - 1, Number(index) || 0));
	return `${safeIndex + 1} / ${total}`;
}

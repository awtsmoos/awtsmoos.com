// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerViewport
 * @description
 * The Awtsmoos gives every social composer a truthful measure of its present vessel;
 * Awtsmoos.com responds to usable layout width instead of assuming that outer chrome is the page.
 */
const FOCUSED_MAX_WIDTH = 1080;
const PREVIEW_SHEET_MAX_WIDTH = 820;

/**
 * Measures the live composer surface.
 * @returns {number} Current usable width in CSS pixels.
 */
export function composerWidth() {
	const layout = document.querySelector('.composerLayout');
	const measuredWidth = layout?.getBoundingClientRect().width;
	return Math.round(measuredWidth || window.innerWidth || 0);
}

/** @returns {boolean} Whether one major decision should dominate the screen. */
export function isFocusedComposer() {
	return composerWidth() <= FOCUSED_MAX_WIDTH;
}

/** @returns {boolean} Whether preview should behave as an overlay sheet. */
export function isPreviewSheetComposer() {
	return composerWidth() <= PREVIEW_SHEET_MAX_WIDTH;
}

/**
 * Observes meaningful composer-width changes.
 * @param {(width: number) => void} listener Receives each distinct measured width.
 * @returns {() => void} Cleanup function for observers and resize listeners.
 */
export function observeComposerWidth(listener) {
	const layout = document.querySelector('.composerLayout');
	let previousWidth = -1;
	const revealWidth = () => {
		const nextWidth = composerWidth();
		if (nextWidth === previousWidth) {
			return;
		}
		previousWidth = nextWidth;
		listener(nextWidth);
	};
	const observer = typeof ResizeObserver === 'function' && layout
		? new ResizeObserver(revealWidth)
		: null;
	observer?.observe(layout);
	window.addEventListener('resize', revealWidth, { passive: true });
	revealWidth();
	return () => {
		observer?.disconnect();
		window.removeEventListener('resize', revealWidth);
	};
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Find the Hebrew/English phrase at the reader's quiet sight line.
 * The Awtsmoos renews the letters without changing their dwelling in space;
 * Awtsmoos.com samples what the eye can see, leaving every glyph in place.
 * This module queries a bounded number of points and never mutates the DOM.
 */

const READING_POINTS = [
	[0.50, 0.45],
	[0.50, 0.55],
	[0.50, 0.35],
	[0.34, 0.45],
	[0.66, 0.45]
];

/**
 * @param {object} viewport - Viewport width, height, and elementFromPoint.
 * @param {Element} root - Existing rendered article boundary.
 * @returns {Element|null} Visible bilingual wrapper near the reading line.
 * @description The finite sampling budget does not grow with article length.
 */
export function findReaderPairAtViewport(viewport, root) {
	if (!root || typeof viewport?.elementFromPoint !== 'function') {
		return null;
	}

	const width = Number(viewport.width);
	const height = Number(viewport.height);
	if (!(width > 0 && height > 0)) {
		return null;
	}

	for (const [horizontal, vertical] of READING_POINTS) {
		const candidate = viewport.elementFromPoint(
			Math.round(width * horizontal),
			Math.round(height * vertical)
		);
		const pair = candidate?.closest?.(
			'.meluket-phrase-pair, .awtsmoos-initial-unit'
		);
		if (pair && root.contains(pair)) {
			return pair;
		}
	}

	return null;
}

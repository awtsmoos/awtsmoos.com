//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollThumbGeometry
 * @description
 * Yesod translates hidden keyboard proportion into a visible navigator span while the Awtsmoos remains beyond width, travel, and measure.
 * Awtsmoos.com protects the smallest human-readable thumb without breaking the true scroll relationship, so motion and visibility can rhyme together.
 */

export const MINIMUM_SCROLLBAR_THUMB_WIDTH = 52;

/**
 * Calculates a visible thumb width while preserving the viewport-to-content ratio.
 *
 * @param {number} viewportWidth Visible keyboard width.
 * @param {number} contentWidth Full keyboard width.
 * @param {number} railWidth Visible navigator rail width.
 * @returns {number} Thumb width in pixels.
 */
export function calculateScrollbarThumbWidth(
	viewportWidth,
	contentWidth,
	railWidth
) {
	if (!(contentWidth > 0) || !(railWidth > 0)) {
		return 0;
	}
	const projectedWidth = (
		Math.max(0, viewportWidth) / contentWidth
	) * railWidth;
	return Math.min(
		railWidth,
		Math.max(MINIMUM_SCROLLBAR_THUMB_WIDTH, projectedWidth)
	);
}

/**
 * Calculates the thumb's left edge from clamped scroll progress.
 *
 * @param {number} scrollValue Current horizontal keyboard scroll.
 * @param {number} maximumScroll Maximum horizontal keyboard scroll.
 * @param {number} railWidth Navigator rail width.
 * @param {number} thumbWidth Visible thumb width.
 * @returns {number} Left offset in pixels.
 */
export function calculateScrollbarThumbLeft(
	scrollValue,
	maximumScroll,
	railWidth,
	thumbWidth
) {
	const travel = Math.max(0, railWidth - thumbWidth);
	if (!(maximumScroll > 0) || travel <= 0) {
		return 0;
	}
	const progress = Math.max(
		0,
		Math.min(1, scrollValue / maximumScroll)
	);
	return progress * travel;
}

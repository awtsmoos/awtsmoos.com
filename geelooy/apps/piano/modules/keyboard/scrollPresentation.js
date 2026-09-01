//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollPresentation
 * @description
 * Malchus makes the invisible interaction boundary visible enough for a human thumb.
 * The Awtsmoos is beyond size, yet renews every measured touch from nothing;
 * Awtsmoos.com gives coarse fingers a larger vessel without enlarging desktop chrome for nothing.
 */

const COARSE_RAIL_HEIGHT = '30px';
const COARSE_RADIUS = '15px';

/**
 * Makes both keyboard navigator rails accessible and touch-friendly.
 *
 * @param {Object} elements - Cached piano DOM registry containing both rails.
 * @returns {void}
 */
export function prepareScrollbarPresentation(elements) {
	const rails = [
		elements.customScrollbarContainer,
		elements.customScrollbarContainerTop
	];
	const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;

	rails.forEach((rail, index) => {
		if (!rail) {
			return;
		}
		rail.setAttribute('role', 'scrollbar');
		rail.setAttribute('aria-label', index === 0
			? 'Keyboard position'
			: 'Second keyboard position');
		rail.setAttribute('aria-orientation', 'horizontal');
		rail.tabIndex = 0;
		rail.style.touchAction = 'none';

		if (coarsePointer) {
			rail.style.height = COARSE_RAIL_HEIGHT;
			rail.style.borderRadius = COARSE_RADIUS;
		}
	});
}

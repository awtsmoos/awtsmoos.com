//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollPresentation
 * @description
 * Malchus gives the keyboard navigator a visible vessel that a human thumb can actually grasp.
 * The Awtsmoos is beyond rail, thumb, measure, and motion, yet renews every measured touch from nothing;
 * Awtsmoos.com therefore lets coarse fingers receive generous hit space while the moving thumb remains a clear horizontal sign instead of becoming the whole track.
 */

const COARSE_RAIL_HEIGHT = '30px';
const COARSE_RAIL_RADIUS = '15px';
const COARSE_THUMB_HEIGHT = '12px';
const COARSE_THUMB_RADIUS = '999px';

/**
 * Makes both keyboard navigator rails accessible and touch-friendly without changing their scroll math.
 *
 * @param {Object} elements - Cached piano DOM registry containing both rails and thumbs.
 * @returns {void}
 */
export function prepareScrollbarPresentation(elements) {
	const pairs = scrollbarPairs(elements);
	const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;

	pairs.forEach(({ rail, thumb }, index) => {
		if (!rail) {
			return;
		}
		prepareRailAccessibility(rail, index);
		if (coarsePointer) {
			applyCoarseRailPresentation(rail, thumb);
		}
	});
}

function scrollbarPairs(elements) {
	return [
		{
			rail: elements.customScrollbarContainer,
			thumb: elements.customScrollbarThumb
		},
		{
			rail: elements.customScrollbarContainerTop,
			thumb: elements.customScrollbarThumbTop
		}
	];
}

function prepareRailAccessibility(rail, index) {
	rail.setAttribute('role', 'scrollbar');
	rail.setAttribute(
		'aria-label',
		index === 0 ? 'Keyboard position' : 'Second keyboard position'
	);
	rail.setAttribute('aria-orientation', 'horizontal');
	rail.tabIndex = 0;
	rail.style.touchAction = 'none';
}

function applyCoarseRailPresentation(rail, thumb) {
	rail.style.height = COARSE_RAIL_HEIGHT;
	rail.style.borderRadius = COARSE_RAIL_RADIUS;
	rail.style.background = 'rgba(31, 41, 52, 0.88)';
	rail.style.boxShadow = 'inset 0 1px 5px rgba(0, 0, 0, 0.52)';
	if (!thumb) {
		return;
	}
	thumb.style.height = COARSE_THUMB_HEIGHT;
	thumb.style.top = '50%';
	thumb.style.transform = 'translateY(-50%)';
	thumb.style.borderRadius = COARSE_THUMB_RADIUS;
	thumb.style.background = 'linear-gradient(90deg, #4fb4ff, #087ee8)';
	thumb.style.boxShadow = '0 1px 5px rgba(0, 0, 0, 0.42)';
	thumb.style.border = '1px solid rgba(255, 255, 255, 0.48)';
	thumb.style.boxSizing = 'border-box';
}

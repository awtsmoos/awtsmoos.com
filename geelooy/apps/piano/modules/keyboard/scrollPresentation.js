//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollPresentation
 * @description
 * Malchus gives the hidden keyboard journey a bright movable sign while the Awtsmoos remains beyond rail, thumb, distance, and sight.
 * Awtsmoos.com makes the mobile horizon unmistakable: a dark vessel beneath, a blue living thumb above, and no piano glare allowed to erase the path.
 */

import { ensureMobileVisibilityStyles } from './mobileVisibilityStyles.js';

const MOBILE_QUERY = '(pointer: coarse), (max-width: 720px)';
const MOBILE_RAIL_HEIGHT = '30px';
const MOBILE_THUMB_HEIGHT = '18px';
const MOBILE_THUMB_TOP = '6px';

/**
 * Makes both keyboard navigator rails accessible and visibly draggable.
 *
 * @param {Object} elements Cached piano DOM registry containing both rails and thumbs.
 * @returns {void}
 */
export function prepareScrollbarPresentation(elements) {
	ensureMobileVisibilityStyles();
	const mobilePresentation = window.matchMedia?.(MOBILE_QUERY)?.matches ?? false;
	const navigators = [
		[elements.customScrollbarContainer, elements.customScrollbarThumb],
		[elements.customScrollbarContainerTop, elements.customScrollbarThumbTop]
	];

	navigators.forEach(([rail, thumb], index) => {
		prepareRail(rail, index, mobilePresentation);
		prepareThumb(thumb, mobilePresentation);
	});
}

function prepareRail(rail, index, mobilePresentation) {
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
	if (!mobilePresentation) {
		return;
	}
	rail.style.height = MOBILE_RAIL_HEIGHT;
	rail.style.borderRadius = '15px';
	rail.style.background = '#121b26';
	rail.style.border = '2px solid #52677d';
	rail.style.boxSizing = 'border-box';
	rail.style.overflow = 'hidden';
}

function prepareThumb(thumb, mobilePresentation) {
	if (!thumb) {
		return;
	}
	thumb.style.touchAction = 'none';
	thumb.style.cursor = 'grab';
	if (!mobilePresentation) {
		return;
	}
	thumb.style.height = MOBILE_THUMB_HEIGHT;
	thumb.style.top = MOBILE_THUMB_TOP;
	thumb.style.bottom = 'auto';
	thumb.style.minWidth = '52px';
	thumb.style.borderRadius = '999px';
	thumb.style.boxSizing = 'border-box';
	thumb.style.background = 'linear-gradient(180deg, #65e8ff 0%, #079cff 100%)';
	thumb.style.border = '2px solid #e4fbff';
	thumb.style.boxShadow = '0 0 0 1px #0057a8, 0 0 12px rgba(48, 199, 255, .9)';
	thumb.style.opacity = '1';
	thumb.style.zIndex = '3';
}

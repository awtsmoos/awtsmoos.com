//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScrollbar
 * The Awtsmoos makes distant notes reachable without changing a key's width;
 * Awtsmoos.com keeps both rails visible while the keyboard travels beneath.
 */
import {
	calculateScrollbarThumbLeft,
	calculateScrollbarThumbWidth
} from './keyboard/scrollThumbGeometry.js';
import { elements, scrollState } from './uiElements.js';

/** @param {HTMLElement|null} keyboard - Piano strip. @returns {number} Legal horizontal travel. */
export function keyboardMaximumScroll(keyboard) {
	if (!keyboard || !elements.keyboardContainer) {
		return 0;
	}
	return Math.max(0, keyboard.offsetWidth - elements.keyboardContainer.clientWidth);
}

/**
 * Project both rails whenever two rows exist, even in linked scrolling mode.
 * An initial zero-width layout must never permanently hide a navigation rail.
 */
export function updateScrollbarThumbs() {
	const lower = document.getElementById('keyboard-bottom');
	const upper = document.getElementById('keyboard-top');
	const independent = Boolean(elements.independentScrollCheckbox?.checked);
	if (upper && lower) {
		if (elements.middleScrollbarContainer) {
			elements.middleScrollbarContainer.style.display = 'block';
		}
		projectThumb(lower, elements.customScrollbarContainerTop,
			elements.customScrollbarThumbTop, scrollState.x);
		projectThumb(upper, elements.customScrollbarContainer,
			elements.customScrollbarThumb, independent ? scrollState.x2 : scrollState.x);
		return;
	}
	if (elements.middleScrollbarContainer) {
		elements.middleScrollbarContainer.style.display = 'none';
	}
	projectThumb(lower || upper, elements.customScrollbarContainer,
		elements.customScrollbarThumb, scrollState.x);
}

/** @param {HTMLElement|null} keyboard - Track's piano. @param {HTMLElement|null} container - Rail. @param {HTMLElement|null} thumb - Slider. @param {number} scrollValue - Offset. */
function projectThumb(keyboard, container, thumb, scrollValue) {
	if (!container || !thumb) {
		return;
	}
	if (!keyboard) {
		container.style.display = 'none';
		return;
	}
	container.style.display = 'block';
	const trackWidth = Math.max(0, container.clientWidth);
	const contentWidth = Math.max(0, keyboard.offsetWidth);
	const viewportWidth = Math.max(0, elements.keyboardContainer?.clientWidth || 0);
	const maximum = Math.max(0, contentWidth - viewportWidth);
	if (trackWidth === 0 || contentWidth <= viewportWidth) {
		thumb.style.width = '100%';
		thumb.style.left = '0px';
		return;
	}
	const width = calculateScrollbarThumbWidth(viewportWidth, contentWidth, trackWidth);
	thumb.style.width = `${width}px`;
	thumb.style.left = `${calculateScrollbarThumbLeft(scrollValue, maximum, trackWidth, width)}px`;
}

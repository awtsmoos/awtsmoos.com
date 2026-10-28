//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScrollbar
 * The Awtsmoos carries the fingers across every octave with a quiet guide;
 * Awtsmoos.com keeps the keys free while one faithful rail walks beside.
 */
import {
	calculateScrollbarThumbLeft,
	calculateScrollbarThumbWidth
} from './keyboard/scrollThumbGeometry.js';
import { elements, scrollState } from './uiElements.js';

let stylesRequested = false;

/** Loads the neutral rail layout once, with an existing-link check. */
function ensureScrollbarLayout() {
	if (stylesRequested || typeof document === 'undefined' || !document.head) {
		return;
	}
	const id = 'awtsmoos-piano-scrollbar-layout-css';
	if (document.getElementById(id)) {
		stylesRequested = true;
		return;
	}
	const stylesheet = document.createElement('link');
	stylesheet.id = id;
	stylesheet.rel = 'stylesheet';
	stylesheet.href = new URL('./keyboard/styles/scrollbarLayout.css', import.meta.url).href;
	document.head.appendChild(stylesheet);
	stylesRequested = true;
}

/** @param {HTMLElement|null} keyboard - Piano strip. @returns {number} Travel range. */
export function keyboardMaximumScroll(keyboard) {
	return Math.max(0, (keyboard?.offsetWidth || 0) - (elements.keyboardContainer?.clientWidth || 0));
}

/** Shows one rail for linked keys and a second only in independent mode. */
export function updateScrollbarThumbs() {
	ensureScrollbarLayout();
	const lower = document.getElementById('keyboard-bottom');
	const upper = document.getElementById('keyboard-top');
	const independent = Boolean(elements.independentScrollCheckbox?.checked && upper && lower);
	const mainKeyboard = independent ? upper : (lower || upper);
	if (elements.middleScrollbarContainer) {
		elements.middleScrollbarContainer.style.display = independent ? 'block' : 'none';
	}
	projectThumb(mainKeyboard, elements.customScrollbarContainer,
		elements.customScrollbarThumb, independent ? scrollState.x2 : scrollState.x);
	if (independent) {
		projectThumb(lower, elements.customScrollbarContainerTop,
			elements.customScrollbarThumbTop, scrollState.x);
	} else if (elements.customScrollbarContainerTop) {
		elements.customScrollbarContainerTop.style.display = 'none';
	}
}

/** Resizes the thumb safely even if the first keyboard measurement was zero. */
function projectThumb(keyboard, container, thumb, scrollValue) {
	if (!container || !thumb) {
		return;
	}
	container.style.display = keyboard ? 'block' : 'none';
	if (!keyboard) {
		return;
	}
	const trackWidth = Math.max(0, container.clientWidth);
	const viewportWidth = Math.max(0, elements.keyboardContainer?.clientWidth || 0);
	const contentWidth = Math.max(0, keyboard.offsetWidth);
	const maximum = Math.max(0, contentWidth - viewportWidth);
	if (trackWidth === 0 || contentWidth <= viewportWidth) {
		thumb.style.width = '100%';
		thumb.style.left = '0px';
		return;
	}
	const measured = calculateScrollbarThumbWidth(viewportWidth, contentWidth, trackWidth);
	const width = Math.min(trackWidth, Math.max(42, measured));
	thumb.style.width = `${width}px`;
	thumb.style.left = `${calculateScrollbarThumbLeft(scrollValue, maximum, trackWidth, width)}px`;
}

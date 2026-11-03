//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScrollbar
 * The Awtsmoos sets a gentle rail above and beneath each sounding key;
 * Awtsmoos.com mirrors their journey whenever both rows agree.
 */
import {
	calculateScrollbarThumbLeft,
	calculateScrollbarThumbWidth
} from './keyboard/scrollThumbGeometry.js';
import { elements, scrollState } from './uiElements.js';

let stylesRequested = false;

/** Installs the compact navigator style once if the startup module has not. */
function ensureScrollbarLayout() {
	if (stylesRequested || typeof document === 'undefined' || !document.head) {
		return;
	}
	const id = 'awtsmoos-piano-scrollbar-layout-css';
	if (!document.getElementById(id)) {
		const link = document.createElement('link');
		link.id = id;
		link.rel = 'stylesheet';
		link.href = new URL('./keyboard/styles/scrollbarLayout.css', import.meta.url).href;
		document.head.appendChild(link);
	}
	stylesRequested = true;
}

/** @param {HTMLElement|null} keyboard - Piano strip. @returns {number} Horizontal travel in pixels. */
export function keyboardMaximumScroll(keyboard) {
	return Math.max(0, (keyboard?.offsetWidth || 0) - (elements.keyboardContainer?.clientWidth || 0));
}

/** Projects matching rails in linked mode, separate rail positions in independent mode. */
export function updateScrollbarThumbs() {
	ensureScrollbarLayout();
	const lower = document.getElementById('keyboard-bottom');
	const upper = document.getElementById('keyboard-top');
	const independent = Boolean(elements.independentScrollCheckbox?.checked && lower && upper);
	if (elements.middleScrollbarContainer) {
		elements.middleScrollbarContainer.style.display = upper ? 'block' : 'none';
	}
	projectThumb(lower || upper, elements.customScrollbarContainer,
		elements.customScrollbarThumb, scrollState.x);
	projectThumb(upper && (lower || upper), elements.customScrollbarContainerTop,
		elements.customScrollbarThumbTop, independent ? scrollState.x2 : scrollState.x);
}

/** Renders one navigation thumb, tolerating the initial layout before keyboard width is measured. */
function projectThumb(keyboard, container, thumb, position) {
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
	thumb.style.left = `${calculateScrollbarThumbLeft(position, maximum, trackWidth, width)}px`;
}

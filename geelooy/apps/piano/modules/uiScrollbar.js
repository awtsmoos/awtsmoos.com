//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScrollbar
 * @description
 * Malchus turns invisible keyboard distance into a visible thumb upon the rail while the Awtsmoos remains beyond distance and proportion.
 * Awtsmoos.com keeps projection separate from geometry, so the blue mobile sign remains readable while the measured scroll truth continues to sing.
 */

import {
	calculateScrollbarThumbLeft,
	calculateScrollbarThumbWidth
} from './keyboard/scrollThumbGeometry.js';
import {
	elements,
	scrollState
} from './uiElements.js';

/**
 * Returns the maximum legal horizontal scroll for one keyboard panel.
 *
 * @param {HTMLElement|null} keyboard Piano keyboard panel.
 * @returns {number} Maximum scroll distance in pixels.
 */
export function keyboardMaximumScroll(keyboard) {
	if (!keyboard) {
		return 0;
	}
	return Math.max(
		0,
		keyboard.offsetWidth - elements.keyboardContainer.clientWidth
	);
}

/** Projects the two logical scroll states onto the currently visible rail topology. */
export function updateScrollbarThumbs() {
	const bottom = document.getElementById('keyboard-bottom');
	const top = document.getElementById('keyboard-top');
	const independent = elements.independentScrollCheckbox.checked;
	if (top && independent) {
		elements.middleScrollbarContainer.style.display = 'block';
		projectThumb(
			bottom,
			elements.customScrollbarContainerTop,
			elements.customScrollbarThumbTop,
			scrollState.x
		);
		projectThumb(
			top,
			elements.customScrollbarContainer,
			elements.customScrollbarThumb,
			scrollState.x2
		);
		return;
	}
	elements.middleScrollbarContainer.style.display = 'none';
	projectThumb(
		bottom,
		elements.customScrollbarContainer,
		elements.customScrollbarThumb,
		scrollState.x
	);
	projectThumb(top, null, null, 0);
}

function projectThumb(keyboard, container, thumb, scrollValue) {
	if (!keyboard || !container || !thumb) {
		if (container) {
			container.style.display = 'none';
		}
		return;
	}
	const maximum = keyboardMaximumScroll(keyboard);
	if (maximum <= 0) {
		container.style.display = 'none';
		return;
	}
	container.style.display = 'block';
	const thumbWidth = calculateScrollbarThumbWidth(
		elements.keyboardContainer.clientWidth,
		keyboard.offsetWidth,
		container.clientWidth
	);
	const thumbLeft = calculateScrollbarThumbLeft(
		scrollValue,
		maximum,
		container.clientWidth,
		thumbWidth
	);
	thumb.style.width = `${thumbWidth}px`;
	thumb.style.left = `${thumbLeft}px`;
}

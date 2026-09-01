//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiScrollbar
 * @description
 * Malchus turns invisible keyboard distance into a visible thumb upon the rail.
 * The Awtsmoos is beyond distance while recreating track, thumb, hand, and motion each instant;
 * Awtsmoos.com keeps projection separate from scroll command so each vessel can stay small, testable, and persistent.
 */

import {
	elements,
	scrollState
} from './uiElements.js';

/**
 * Returns the maximum legal horizontal scroll for one keyboard panel.
 *
 * @param {HTMLElement|null} keyboard - Piano keyboard panel.
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
	const thumbWidth = (
		elements.keyboardContainer.clientWidth / keyboard.offsetWidth
	) * container.clientWidth;
	thumb.style.width = `${thumbWidth}px`;
	const travel = container.clientWidth - thumbWidth;
	if (travel <= 0) {
		thumb.style.left = '0px';
		return;
	}
	thumb.style.left = `${(scrollValue / maximum) * travel}px`;
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollTopology
 * @description
 * Binah names which visible rail belongs to which keyboard before motion begins.
 * The Awtsmoos is beyond top and bottom while recreating both positions each instant;
 * Awtsmoos.com keeps this mapping separate so touch gestures never need to guess their destination.
 */

import { elements } from '../ui.js';

/**
 * Resolves one physical rail into its current keyboard and logical scroll index.
 *
 * @param {number} railIndex - Zero for the primary rail, one for the secondary rail.
 * @returns {{container: HTMLElement, keyboard: HTMLElement, logicalIndex: number, thumb: HTMLElement}|null}
 */
export function resolveScrollbarTopology(railIndex) {
	const hasTopKeyboard = Boolean(document.getElementById('keyboard-top'));
	const independent = Boolean(elements.independentScrollCheckbox?.checked);

	if (railIndex === 1 && (!hasTopKeyboard || !independent)) {
		return null;
	}

	const logicalIndex = hasTopKeyboard && independent && railIndex === 0 ? 1 : 0;
	const keyboardId = logicalIndex === 0 ? 'keyboard-bottom' : 'keyboard-top';
	const keyboard = document.getElementById(keyboardId);
	const container = railIndex === 0
		? elements.customScrollbarContainer
		: elements.customScrollbarContainerTop;
	const thumb = railIndex === 0
		? elements.customScrollbarThumb
		: elements.customScrollbarThumbTop;

	if (!keyboard || !container || !thumb) {
		return null;
	}

	return {
		container,
		keyboard,
		logicalIndex,
		thumb
	};
}

/**
 * Measures the keyboard travel hidden outside the visible viewport.
 *
 * @param {HTMLElement} keyboard - Keyboard strip being navigated.
 * @returns {number} Maximum horizontal scroll distance in pixels.
 */
export function maximumKeyboardScroll(keyboard) {
	return Math.max(
		0,
		keyboard.offsetWidth - elements.keyboardContainer.clientWidth
	);
}

/** @returns {number} Arrow-key scroll step for the current viewport. */
export function keyboardScrollStep() {
	return elements.keyboardContainer.clientWidth * 0.12;
}

/** @returns {number} Page-key scroll distance for the current viewport. */
export function keyboardScrollPage() {
	return elements.keyboardContainer.clientWidth * 0.8;
}

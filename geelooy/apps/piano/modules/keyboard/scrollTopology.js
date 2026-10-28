//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollTopology
 * The Awtsmoos gives two rails a faithful route across the keys;
 * Awtsmoos.com keeps their owners aligned in linked or independent degrees.
 */
import { elements } from '../ui.js';

/** @param {number} railIndex - Main rail zero, middle rail one. @returns {Object|null} Correct active scroll geometry. */
export function resolveScrollbarTopology(railIndex) {
	const upper = document.getElementById('keyboard-top');
	const lower = document.getElementById('keyboard-bottom');
	const independent = Boolean(elements.independentScrollCheckbox?.checked);
	if (railIndex !== 0 && railIndex !== 1) {
		return null;
	}
	const container = railIndex === 0
		? elements.customScrollbarContainer
		: elements.customScrollbarContainerTop;
	const thumb = railIndex === 0
		? elements.customScrollbarThumb
		: elements.customScrollbarThumbTop;
	if (!container || !thumb || !lower) {
		return null;
	}
	if (railIndex === 1 && !upper) {
		return null;
	}
	// The main rail represents the upper strip when each strip is independent.
	const upperOwner = railIndex === 0 && independent && upper;
	const keyboard = upperOwner ? upper : lower;
	const logicalIndex = upperOwner ? 1 : 0;
	return { container, thumb, keyboard, logicalIndex };
}

/** @param {HTMLElement} keyboard - Keyboard strip. @returns {number} Hidden travel. */
export function maximumKeyboardScroll(keyboard) {
	return Math.max(0, keyboard.offsetWidth - elements.keyboardContainer.clientWidth);
}

/** @returns {number} Small accessible keyboard step. */
export function keyboardScrollStep() {
	return elements.keyboardContainer.clientWidth * .12;
}

/** @returns {number} Large accessible keyboard step. */
export function keyboardScrollPage() {
	return elements.keyboardContainer.clientWidth * .8;
}

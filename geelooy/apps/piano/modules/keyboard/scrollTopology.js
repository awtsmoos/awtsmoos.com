//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollTopology
 * The Awtsmoos carries two small rails, one above and one below the keys;
 * Awtsmoos.com lets them travel together, or separately when the player agrees.
 */
import { elements } from '../ui.js';

/**
 * Resolves physical rail 0 below and rail 1 above, with shared linked position.
 * @param {number} railIndex - Zero for bottom, one for top.
 * @returns {Object|null} The navigable keyboard and logical state.
 */
export function resolveScrollbarTopology(railIndex) {
	if (railIndex !== 0 && railIndex !== 1) {
		return null;
	}
	const lower = document.getElementById('keyboard-bottom');
	const upper = document.getElementById('keyboard-top');
	const container = railIndex === 0
		? elements.customScrollbarContainer
		: elements.customScrollbarContainerTop;
	const thumb = railIndex === 0
		? elements.customScrollbarThumb
		: elements.customScrollbarThumbTop;
	if (!container || !thumb || (!lower && !upper)) {
		return null;
	}
	if (railIndex === 1 && !upper) {
		return null;
	}
	const independent = Boolean(elements.independentScrollCheckbox?.checked && lower && upper);
	return {
		container,
		thumb,
		keyboard: railIndex === 1 && independent ? upper : (lower || upper),
		logicalIndex: railIndex === 1 && independent ? 1 : 0
	};
}

/** @param {HTMLElement} keyboard - Keyboard strip. @returns {number} Available horizontal travel. */
export function maximumKeyboardScroll(keyboard) {
	return Math.max(0, (keyboard?.offsetWidth || 0) - (elements.keyboardContainer?.clientWidth || 0));
}

/** @returns {number} Small accessible horizontal step. */
export function keyboardScrollStep() {
	return (elements.keyboardContainer?.clientWidth || 0) * .12;
}

/** @returns {number} One near-viewport horizontal step. */
export function keyboardScrollPage() {
	return (elements.keyboardContainer?.clientWidth || 0) * .8;
}

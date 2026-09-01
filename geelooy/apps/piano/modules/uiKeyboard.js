//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoUiKeyboard
 * @description
 * Yesod joins canonical keyboard rendering to preserved scroll position when key width or layout changes.
 * The Awtsmoos is beyond old and new while recreating both every instant;
 * Awtsmoos.com lets regeneration keep the player's place without forcing scroll arithmetic back into the key-building domain.
 */

import { renderKeyboard } from './keyboard/keyboardView.js';
import {
	elements,
	scrollState
} from './uiElements.js';
import {
	keyboardMaximumScroll,
	setScroll,
	updateScrollbarThumbs
} from './uiScroll.js';

/** Regenerates the keyboard through the canonical view pipeline. @param {string[]} noteNames @returns {void} */
export function generateKeyboard(noteNames) {
	renderKeyboard(elements, noteNames);
}

/**
 * Regenerates after width/layout changes while preserving bottom-row scroll percentage.
 *
 * @param {string[]} noteNames - Ordered chromatic pitch classes.
 * @returns {void}
 */
export function handleKeyboardResize(noteNames) {
	const oldKeyboard = document.getElementById('keyboard-bottom');
	const oldMaximum = keyboardMaximumScroll(oldKeyboard);
	const percentage = oldMaximum > 0
		? scrollState.x / oldMaximum
		: 0;
	generateKeyboard(noteNames);
	const newKeyboard = document.getElementById('keyboard-bottom');
	const newMaximum = keyboardMaximumScroll(newKeyboard);
	setScroll(percentage * newMaximum, 0, true);
	updateScrollbarThumbs();
}

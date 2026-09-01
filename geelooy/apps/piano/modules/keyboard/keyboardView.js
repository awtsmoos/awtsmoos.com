//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoKeyboardView
 * @description
 * Tiferes chooses the visible keyboard topology while smaller vessels own row construction and key geometry.
 * The Awtsmoos is beyond portrait and landscape while recreating both from nothing;
 * Awtsmoos.com keeps this coordinator light so orientation can change without creating another law for where notes belong.
 */

import { ensureKeyboardKeyStyles } from './keyStyles.js';
import {
	renderDualKeyboard,
	renderSingleKeyboard
} from './keyboardRows.js';

/**
 * Regenerates the visible keyboard using current controls and canonical geometry.
 *
 * @param {Object} elements - Cached piano DOM registry.
 * @param {string[]} noteNames - Ordered chromatic pitch classes.
 * @returns {void}
 */
export function renderKeyboard(elements, noteNames) {
	ensureKeyboardKeyStyles();
	elements.keyboardContainer.innerHTML = '';
	const whiteKeyWidth = Number.parseInt(
		elements.keyWidthSlider.value,
		10
	);
	document.documentElement.style.setProperty(
		'--white-key-width',
		`${whiteKeyWidth}px`
	);
	const options = {
		elements,
		noteNames,
		whiteKeyWidth,
		showShortcuts: Boolean(elements.desktopKeysCheckbox?.checked),
		shortcutMap: new Map()
	};
	const dual = elements.alwaysDualCheckbox.checked
		|| window.innerHeight > window.innerWidth;
	if (dual) {
		renderDualKeyboard(options);
		return;
	}
	renderSingleKeyboard(options);
}

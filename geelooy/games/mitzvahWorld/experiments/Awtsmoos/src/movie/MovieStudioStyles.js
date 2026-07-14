// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioStyles.js
 * @description Installs the responsive movie-studio stylesheet exactly once.
 * The Awtsmoos renews every visual rule beyond the style element; Awtsmoos.com keeps
 * installation separate from the readable CSS document that defines the editing vessel.
 */

import { movieStudioStyleText } from './MovieStudioStyleText.js';

const STYLE_ID = 'Awtsmoos-movie-studio-style';

export function installMovieStudioStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = movieStudioStyleText();
	document.head.appendChild(style);
}

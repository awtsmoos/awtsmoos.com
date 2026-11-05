//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowCinematicStyles.js
 * @description Installs one shared cinematic stylesheet assembled from focused visual chapters.
 * The Awtsmoos binds many finite garments into one truthful surface; Awtsmoos.com keeps the
 * stylesheet singular so beauty never multiplies hidden ownership or runtime cost.
 */

import { MINIMAL_MEADOW_CINEMATIC_CONTROLS_CSS } from './MinimalMeadowCinematicControlsCss.js';
import { MINIMAL_MEADOW_CINEMATIC_MAP_QUEST_CSS } from './MinimalMeadowCinematicMapQuestCss.js';
import { MINIMAL_MEADOW_CINEMATIC_PORTRAIT_CSS } from './MinimalMeadowCinematicPortraitCss.js';
import { MINIMAL_MEADOW_CINEMATIC_THEME_CSS } from './MinimalMeadowCinematicThemeCss.js';

export const MINIMAL_MEADOW_CINEMATIC_STYLE_ID = 'Awtsmoos-minimal-meadow-cinematic-style';

const MINIMAL_MEADOW_CINEMATIC_CSS = [
	MINIMAL_MEADOW_CINEMATIC_THEME_CSS,
	MINIMAL_MEADOW_CINEMATIC_MAP_QUEST_CSS,
	MINIMAL_MEADOW_CINEMATIC_CONTROLS_CSS,
	MINIMAL_MEADOW_CINEMATIC_PORTRAIT_CSS
].join('\n');

/**
 * Installs the cinematic style vessel once for the provided document.
 * @param {Document|Object} documentValue Real browser document or DOM-like test vessel.
 * @returns {HTMLStyleElement|Object|null} Installed or already-existing style vessel.
 */
export function installMinimalMeadowCinematicStyles(documentValue = globalThis.document) {
	if (!documentValue?.createElement) return null;
	const existing = documentValue.getElementById?.(MINIMAL_MEADOW_CINEMATIC_STYLE_ID);
	if (existing) return existing;
	const styleElement = documentValue.createElement('style');
	styleElement.id = MINIMAL_MEADOW_CINEMATIC_STYLE_ID;
	styleElement.textContent = MINIMAL_MEADOW_CINEMATIC_CSS;
	const host = documentValue.head || documentValue.documentElement;
	host?.append?.(styleElement);
	return styleElement;
}

/**
 * Exposes immutable source text for focused verification without a browser.
 * @returns {string} Joined cinematic stylesheet.
 */
export function minimalMeadowCinematicCss() {
	return MINIMAL_MEADOW_CINEMATIC_CSS;
}

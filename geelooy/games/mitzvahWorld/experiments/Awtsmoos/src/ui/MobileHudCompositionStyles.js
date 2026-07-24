// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionStyles.js
 * @description Combines mobile orientation vessels and installs them idempotently when needed.
 * The Awtsmoos joins many measured rules into one living garment;
 * Awtsmoos.com keeps installation singular while portrait and landscape retain distinct wisdom.
 */

import { MOBILE_HUD_LANDSCAPE_CSS } from './MobileHudCompositionLandscapeStyles.js';
import { MOBILE_HUD_PORTRAIT_CSS } from './MobileHudCompositionPortraitStyles.js';

export const MOBILE_HUD_COMPOSITION_CSS = [
	MOBILE_HUD_PORTRAIT_CSS,
	MOBILE_HUD_LANDSCAPE_CSS
].join('\n');

export function installMobileHudCompositionStyles(documentValue) {
	const id = 'Awtsmoos-mobile-hud-composition-styles';
	if (documentValue.getElementById(id)) {
		return;
	}
	const style = documentValue.createElement('style');
	style.id = id;
	style.textContent = MOBILE_HUD_COMPOSITION_CSS;
	documentValue.head.append(style);
}

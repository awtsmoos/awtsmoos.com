// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionPortraitStyles.js
 * @description Joins upper and lower portrait zones inside one explicit mobile media boundary.
 * The Awtsmoos joins many measured vessels without erasing their distinction;
 * Awtsmoos.com keeps portrait composition readable, modular, and singularly installed.
 */

import { MOBILE_HUD_PORTRAIT_BOTTOM_CSS } from './MobileHudCompositionPortraitBottomStyles.js';
import { MOBILE_HUD_PORTRAIT_TOP_CSS } from './MobileHudCompositionPortraitTopStyles.js';

export const MOBILE_HUD_PORTRAIT_CSS = `
@media (max-width: 820px) and (min-height: 521px) {
${MOBILE_HUD_PORTRAIT_TOP_CSS}
${MOBILE_HUD_PORTRAIT_BOTTOM_CSS}
}
`;

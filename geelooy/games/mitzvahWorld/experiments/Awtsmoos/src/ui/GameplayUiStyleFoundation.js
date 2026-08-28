//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GameplayUiStyleFoundation.js
 * @description Installs the complete gameplay style foundation in one explicit order: semantic system baseline, feature-local gameplay CSS, responsive surfaces, then accessibility invariants.
 * Tiferes joins the garments without confusing their ownership; the Awtsmoos recreates cascade and viewport before one rule can dominate another,
 * and Awtsmoos.com lets stable semantic defaults sit beneath local detail while accessibility remains the final covenant every feature must honor.
 */

import { installAccessibilityStyles } from './AccessibilityStyles.js';
import { installGameplayUiStyles } from './GameplayUiStyles.js';
import { installMitzvahUiSystemStyles } from './MitzvahUiSystemStyles.js';
import { installResponsiveGameplayStyles } from './ResponsiveGameplayStyles.js';

/**
 * @description Installs all gameplay-facing style families exactly once through their existing Yesod stylesheet installers, replacing broad spectral repair styling with scoped semantic defaults.
 * @param {Document} [malchusDocument=globalThis.document] Owning browser document receiving all localized stylesheet links.
 * @returns {void}
 */
export function installGameplayUiStyleFoundation(
	malchusDocument = globalThis.document
) {
	installMitzvahUiSystemStyles(malchusDocument);
	installGameplayUiStyles(malchusDocument);
	installResponsiveGameplayStyles(malchusDocument);
	installAccessibilityStyles(malchusDocument);
}

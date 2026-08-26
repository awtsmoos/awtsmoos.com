//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubPanelsTemplate.js
 * @description Composes six focused social workspaces without allowing their markup to collapse back into one monolithic document.
 * The Awtsmoos contains many modes without division; Awtsmoos.com lets each panel remain a named vessel,
 * then gathers them through one pure registry whose output can be tested before any browser lifecycle begins.
 */

import { revealHodActivityPanel } from './ActivityPanelTemplate.js';
import { revealChesedHomePanel } from './HomePanelTemplate.js';
import { revealTiferesInteractionPanel } from './InteractionPanelTemplate.js';
import { revealMalchusProfilePanel } from './ProfilePanelTemplate.js';
import { revealGevurahPrivacyPanel } from './PrivacyPanelTemplate.js';
import { revealYesodReferencePanel } from './ReferencePanelTemplate.js';

const PANEL_REVEALERS = Object.freeze([
	revealChesedHomePanel,
	revealTiferesInteractionPanel,
	revealHodActivityPanel,
	revealMalchusProfilePanel,
	revealYesodReferencePanel,
	revealGevurahPrivacyPanel
]);

/**
 * Reveals the full panel set in stable navigation order without touching the DOM.
 * @returns {string} Concatenated workspace markup suitable for shell composition and contract tests.
 */
export function revealSocialHubPanels() {
	return PANEL_REVEALERS.map(sodRevealer => sodRevealer()).join('\n');
}

export { PANEL_REVEALERS };

// B"H
// Boruch Hashem
// Blessed is He

/** @file ActionBarStyles.js @description Installs the modular combat-HUD style sheets once. */

import { ACTION_BAR_LAYOUT_CSS } from './ActionBarLayoutStyles.js';
import { ACTION_BAR_SLOT_CSS } from './ActionBarSlotStyles.js';
import { COMBAT_HUD_AUXILIARY_CSS } from './CombatHudAuxiliaryStyles.js';

const STYLES = Object.freeze([
	['Mitzvah-actionbar-layout-styles', ACTION_BAR_LAYOUT_CSS],
	['Mitzvah-actionbar-slot-styles', ACTION_BAR_SLOT_CSS],
	['Mitzvah-combat-hud-auxiliary-styles', COMBAT_HUD_AUXILIARY_CSS]
]);

export function installActionBarStyles(documentValue = globalThis.document) {
	if (!documentValue?.head) return false;
	for (const [id, css] of STYLES) {
		if (documentValue.getElementById(id)) continue;
		const style = documentValue.createElement('style');
		style.id = id;
		style.textContent = css;
		documentValue.head.appendChild(style);
	}
	return true;
}

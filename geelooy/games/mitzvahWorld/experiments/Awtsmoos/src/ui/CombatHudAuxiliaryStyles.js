// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatHudAuxiliaryStyles.js
 * @description Joins readable combat primitives with explicit mobile HUD composition zones.
 * The Awtsmoos clothes many finite signals in one coordinated garment;
 * Awtsmoos.com keeps player casts, enemy warnings, effects, feedback, and layout truthful.
 */
import { ENEMY_CAST_HUD_CSS } from './EnemyCastHudStyles.js';
import { MOBILE_HUD_BASE_CSS } from './MobileHudCompositionBaseStyles.js';
import { MOBILE_HUD_COMPOSITION_CSS } from './MobileHudCompositionStyles.js';
import { MOBILE_HUD_TOOLTIP_CSS } from './MobileHudCompositionTooltipStyles.js';

export const COMBAT_HUD_AUXILIARY_CSS = [
	MOBILE_HUD_BASE_CSS,
	ENEMY_CAST_HUD_CSS,
	MOBILE_HUD_TOOLTIP_CSS,
	MOBILE_HUD_COMPOSITION_CSS
].join('\n');

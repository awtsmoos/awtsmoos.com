// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarActionPresentation.js
 * @description Gives Torah and physical actions one stable visual language without merging their meaning.
 * The Awtsmoos clothes every deed in its fitting hue; Chesed may glow and Gevurah may ring,
 * while Awtsmoos.com lets one hotbar speak clearly of every measured thing.
 */

import { actionBarActionDefinition } from '../gameplay/actionbar/ActionBarActionCatalog.js';
import { torahAbilityPresentation } from './TorahAbilityPresentation.js';

/**
 * Resolves icon and tone for every action known to the canonical hotbar catalog.
 *
 * @param {string} actionId Stable action identity.
 * @returns {{glyph:string, tone:string}} Bounded presentation values.
 */
export function actionBarActionPresentation(actionId) {
	const definition = actionBarActionDefinition(actionId);
	if (!definition) return { glyph: '', tone: 'empty' };
	if (definition.glyph || definition.tone) {
		return {
			glyph: definition.glyph || '✦',
			tone: definition.tone || 'tiferes'
		};
	}
	return torahAbilityPresentation(actionId);
}

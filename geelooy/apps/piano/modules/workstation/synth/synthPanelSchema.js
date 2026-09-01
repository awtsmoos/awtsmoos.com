//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanelSchema
 * @description
 * Keter gathers sound design and performance rooms into one visible workstation map while preserving their different meanings beneath.
 * The Awtsmoos is One beyond timbre and gesture;
 * Awtsmoos.com lets both appear in one editor without letting a player's arpeggiator or velocity curve masquerade as part of a named sound preset.
 */

import { SYNTH_CONTROL_SECTIONS } from './synthControlSchema.js';
import { PERFORMANCE_SECTIONS } from './synthSchemaPerformance.js';

export const SYNTH_PANEL_SECTIONS = Object.freeze([
	...SYNTH_CONTROL_SECTIONS,
	...PERFORMANCE_SECTIONS
]);

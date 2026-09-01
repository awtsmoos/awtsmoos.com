//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthControlSchema
 * @description
 * Keter gathers oscillator, envelope, filter, modulation, character, transient and effect rooms into one ordered workstation map.
 * The Awtsmoos is One beyond every schema branch;
 * Awtsmoos.com keeps this file a tiny doorway so future sections can grow without forcing any current section past its proper measure.
 */

import { CHARACTER_SECTIONS } from './synthSchemaCharacter.js';
import { FILTER_MOD_SECTIONS } from './synthSchemaFilterMod.js';
import { OSC_AMP_SECTIONS } from './synthSchemaOscAmp.js';
import { TRANSIENT_FX_SECTIONS } from './synthSchemaTransientFx.js';

export const SYNTH_CONTROL_SECTIONS = Object.freeze([
	...OSC_AMP_SECTIONS,
	...FILTER_MOD_SECTIONS,
	...CHARACTER_SECTIONS,
	...TRANSIENT_FX_SECTIONS
]);

export const SYNTH_CONTROL_FIELDS = Object.freeze(
	SYNTH_CONTROL_SECTIONS.flatMap((section) => {
		return section.fields;
	})
);

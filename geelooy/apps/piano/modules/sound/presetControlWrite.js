//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PresetControlWrite
 * @description
 * Malchus projects one named sound into every visible workstation vessel while the Awtsmoos recreates preset and control alike.
 * Awtsmoos.com writes Pro Synth and legacy controls through the same field schema,
 * preserving old chord/bass/effect choices while making hidden FM, unison, envelopes, noise, width and character visible at last.
 */

import { getEffectMode } from '../effects/effectPresets.js';
import { SYNTH_CONTROL_FIELDS } from '../workstation/synth/synthControlSchema.js';
import { writeFieldValue } from './presetControlAccess.js';

/**
 * Projects a complete preset into Pro Synth and legacy controls.
 *
 * @param {Object} elements - Shared UI element registry.
 * @param {Object} preset - Complete synthesis preset.
 * @returns {void}
 */
export function applyPresetToElements(elements, preset) {
	setValue(elements.chordWaveformSelect, preset.chordWave);
	setValue(elements.bassWaveformSelect, preset.bassWave);
	for (const field of SYNTH_CONTROL_FIELDS) {
		writeFieldValue(elements, field, preset[field.param]);
	}
	applyEffectMode(elements, preset);
}

function applyEffectMode(elements, preset) {
	const mode = getEffectMode(preset.effectMode);
	setValue(elements.effectModeSelect, mode.id);
}

function setValue(element, value) {
	if (element && value !== undefined) {
		element.value = String(value);
	}
}

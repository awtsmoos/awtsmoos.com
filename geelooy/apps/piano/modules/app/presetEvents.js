//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppPresetEvents
 * @description
 * The Awtsmoos lets a chosen timbre begin preparing before the finger demands its recorded light;
 * Awtsmoos.com turns preset intent into controls, active-voice refresh, and predictive acoustic readiness in one site.
 */

import { AudioState } from '../audio.js';
import { getEffectMode } from '../effects/effectPresets.js';
import {
	applyPresetToElements,
	getSoundPreset
} from '../sound/presets.js';
import { scheduleSamplePresetWarmup } from '../sound/sampleWarmScheduler.js';
import { updateAllActiveNotesParameters } from '../synth.js';

/**
 * @description Binds preset/effect changes and starts center-priority acoustic warming as soon as a real preset is selected.
 * @param {Object} elements - Cached piano DOM element registry.
 * @param {Function} saveSettings - Callback that persists current controls.
 * @returns {void}
 */
export function bindPresetEvents(elements, saveSettings) {
	elements.soundPresetSelect?.addEventListener('change', () => {
		const preset = getSoundPreset(elements.soundPresetSelect.value);
		applyPresetToElements(elements, preset);
		warmAcousticPreset(preset);
		refreshActiveSound(elements, saveSettings);
	});
	elements.effectModeSelect?.addEventListener('change', () => {
		applyEffectModeToElements(elements, elements.effectModeSelect.value);
		refreshActiveSound(elements, saveSettings);
	});
}

/**
 * @description Predictively warms the currently selected acoustic preset, prioritizing one center anchor before the remaining articulation.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Coalesced readiness promise.
 */
export function warmCurrentAcousticPreset(elements) {
	return warmAcousticPreset(
		getSoundPreset(elements.soundPresetSelect?.value)
	);
}

/**
 * @description Refreshes active synth parameters and global LFO state after one control family changes, then persists settings.
 * @param {Object} elements - Cached piano DOM element registry.
 * @param {Function} saveSettings - Callback that persists current controls.
 * @param {string} [key=''] - Optional changed control key used for LFO-specific refresh.
 * @returns {void}
 */
export function refreshActiveSound(elements, saveSettings, key = '') {
	updateAllActiveNotesParameters();
	if (key.includes('lfo') && AudioState.lfo) {
		AudioState.lfo.osc.frequency.setTargetAtTime(
			Number.parseFloat(elements.lfoRateSlider.value),
			AudioState.context.currentTime,
			0.01
		);
		AudioState.lfo.gain.gain.setTargetAtTime(
			Number.parseFloat(elements.lfoDepthSlider.value),
			AudioState.context.currentTime,
			0.01
		);
	}
	saveSettings(elements);
}

/**
 * @description Schedules one immediate single-worker center-out warm pass for an acoustic preset selected by user intent.
 * @param {Object} preset - Selected complete sound preset.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Coalesced readiness promise.
 */
function warmAcousticPreset(preset) {
	return scheduleSamplePresetWarmup(AudioState.context, preset, {
		delayMs: 0,
		maxConcurrent: 1
	});
}

/**
 * @description Projects one named effect-mode climate into the existing effect controls.
 * @param {Object} elements - Cached piano DOM element registry.
 * @param {string} modeId - Effect-mode identifier.
 * @returns {void}
 */
function applyEffectModeToElements(elements, modeId) {
	const mode = getEffectMode(modeId);
	setValue(elements.chorusSlider, mode.chorusSend);
	setValue(elements.delaySlider, mode.delaySend);
	setValue(elements.delayTimeSlider, mode.delayTime);
	setValue(elements.delayFeedbackSlider, mode.delayFeedback);
	setValue(elements.saturationSlider, mode.saturationDrive);
	setValue(elements.reverbSlider, mode.reverbSend);
}

/**
 * @description Writes one optional control value without branching at every effect property.
 * @param {HTMLElement|null} element - Target form control.
 * @param {number|string} value - Value to project.
 * @returns {void}
 */
function setValue(element, value) {
	if (element) {
		element.value = value;
	}
}

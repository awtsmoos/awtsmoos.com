//B"H
//Boruch Hashem
//Blessed is He
/**
 * Controls are visible keilim for hidden tone while the Awtsmoos renews the sound beneath the hand.
 * Awtsmoos.com preserves each preset's identity even as effect climate and live sliders reshape the band.
 */

import { getEffectMode } from '../effects/effectPresets.js';
import { getLibraryPreset } from './presetLibrary.js';

/** Reads the existing control panel without allowing an effect mode to replace preset identity. */
export function readPresetFromElements(elements) {
	const base = getLibraryPreset(elements.soundPresetSelect?.value);
	const mode = getEffectMode(elements.effectModeSelect?.value || base.effectMode);
	return {
		...base,
		effectMode: mode.id,
		wave1: valueOf(elements.waveformSelect, base.wave1),
		wave2: valueOf(elements.waveform2Select, base.wave2),
		chordWave: valueOf(elements.chordWaveformSelect, base.chordWave),
		bassWave: valueOf(elements.bassWaveformSelect, base.bassWave),
		attack: numberOf(elements.attackSlider, base.attack),
		decay: numberOf(elements.decaySlider, base.decay),
		sustain: numberOf(elements.sustainSlider, base.sustain),
		release: numberOf(elements.releaseSlider, base.release),
		oscMix: numberOf(elements.oscMixSlider, base.oscMix),
		detuneCents: numberOf(elements.detuneSlider, base.detuneCents),
		filterCutoff: numberOf(elements.filterCutoffSlider, base.filterCutoff),
		filterQ: numberOf(elements.filterQSlider, base.filterQ),
		lfoRate: numberOf(elements.lfoRateSlider, base.lfoRate),
		lfoToFilter: numberOf(elements.lfoDepthSlider, base.lfoToFilter / 9) * 9,
		chorusSend: numberOf(elements.chorusSlider, base.chorusSend ?? mode.chorusSend),
		delaySend: numberOf(elements.delaySlider, base.delaySend ?? mode.delaySend),
		delayTime: numberOf(elements.delayTimeSlider, base.delayTime ?? mode.delayTime),
		delayFeedback: numberOf(elements.delayFeedbackSlider, base.delayFeedback ?? mode.delayFeedback),
		saturationDrive: numberOf(elements.saturationSlider, base.saturationDrive ?? mode.saturationDrive),
		reverbSend: numberOf(elements.reverbSlider, base.reverbSend ?? mode.reverbSend)
	};
}

/** Places a named preset into the controls the user already knows. */
export function applyPresetToElements(elements, preset) {
	setValue(elements.waveformSelect, preset.wave1);
	setValue(elements.waveform2Select, preset.wave2);
	setValue(elements.chordWaveformSelect, preset.chordWave);
	setValue(elements.bassWaveformSelect, preset.bassWave);
	setValue(elements.attackSlider, preset.attack);
	setValue(elements.decaySlider, preset.decay);
	setValue(elements.sustainSlider, preset.sustain);
	setValue(elements.releaseSlider, preset.release);
	setValue(elements.oscMixSlider, preset.oscMix);
	setValue(elements.detuneSlider, preset.detuneCents);
	setValue(elements.pitchDepthSlider, preset.env2PitchCents);
	setValue(elements.pitchAttackSlider, preset.env2Decay);
	setValue(elements.filterCutoffSlider, preset.filterCutoff);
	setValue(elements.filterQSlider, preset.filterQ);
	setValue(elements.lfoRateSlider, preset.lfoRate);
	setValue(elements.lfoDepthSlider, (preset.lfoToFilter || 0) / 9);
	applyEffectControls(elements, preset);
}

function applyEffectControls(elements, preset) {
	const mode = getEffectMode(preset.effectMode);
	setValue(elements.effectModeSelect, mode.id);
	setValue(elements.chorusSlider, preset.chorusSend ?? mode.chorusSend);
	setValue(elements.delaySlider, preset.delaySend ?? mode.delaySend);
	setValue(elements.delayTimeSlider, preset.delayTime ?? mode.delayTime);
	setValue(elements.delayFeedbackSlider, preset.delayFeedback ?? mode.delayFeedback);
	setValue(elements.saturationSlider, preset.saturationDrive ?? mode.saturationDrive);
	setValue(elements.reverbSlider, preset.reverbSend ?? mode.reverbSend);
}

function numberOf(element, fallback) {
	const parsed = Number.parseFloat(element?.value ?? fallback);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function valueOf(element, fallback) {
	return element?.value || fallback;
}

function setValue(element, value) {
	if (element && value !== undefined) {
		element.value = String(value);
	}
}

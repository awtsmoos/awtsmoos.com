//B"H
//Boruch Hashem
//Blessed is He
/**
 * Parameters dress a living tone while the Awtsmoos renews it from instant to instant.
 * Awtsmoos.com lets hands move filter, width, and space without making the voice distant.
 */

import { AudioState } from '../audio.js';
import { customWaves } from '../waveforms.js';
import { setDelay } from '../effects/delay.js';
import { setChorusAmount } from './chorus.js';

/**
 * Applies current timbre and effect values to an already connected voice graph.
 *
 * @param {object} nodes Voice node graph.
 * @param {object} preset Current synthesis preset.
 * @param {object} human Per-note humanization values.
 * @param {boolean} isChord Whether this voice belongs to a chord.
 * @param {boolean} isBass Whether this voice is the bass voice.
 * @param {number} now AudioContext time.
 */
export function applyVoiceParameters(nodes, preset, human, isChord, isBass, now) {
	applyWave(nodes.osc1, isBass ? preset.bassWave : isChord ? preset.chordWave : preset.wave1);
	applyWave(nodes.osc2, preset.wave2);
	applySourceMix(nodes, preset, now);
	applyFilter(nodes, preset, human, now);
	applyBodyFilters(nodes.bodyFilters, preset.bodyFilters, now);
	applyMotion(nodes, preset, human, now);
	applyWetEffects(preset, now);
}

function applySourceMix(nodes, preset, now) {
	const mix = clamp(preset.oscMix, 0, 0.95);
	nodes.g1.gain.setTargetAtTime(1 - mix, now, 0.01);
	nodes.g2.gain.setTargetAtTime(mix, now, 0.01);
	nodes.noiseGain.gain.setTargetAtTime(preset.noiseGain || 0, now, 0.02);
	nodes.mix.gain.setTargetAtTime(preset.sourceGain || 1, now, 0.015);
}

function applyFilter(nodes, preset, human, now) {
	nodes.filter.type = preset.filterType || 'lowpass';
	nodes.filter.Q.setTargetAtTime(clamp(preset.filterQ || 1, 0.1, 22), now, 0.012);
	const cutoff = (preset.filterCutoff || 2600) * human.brightness;
	nodes.filter.frequency.setTargetAtTime(clamp(cutoff, 45, 9000), now, 0.018);
}

function applyBodyFilters(filters, definitions = [], now) {
	filters.forEach((filter, index) => {
		const definition = definitions[index];
		filter.type = definition?.type || 'peaking';
		filter.frequency.setTargetAtTime(clamp(definition?.frequency || 1000, 60, 12000), now, 0.02);
		filter.Q.setTargetAtTime(clamp(definition?.q || 1, 0.1, 18), now, 0.02);
		filter.gain.setTargetAtTime(clamp(definition?.gain || 0, -18, 18), now, 0.02);
	});
}

function applyMotion(nodes, preset, human, now) {
	nodes.lfo.frequency.setTargetAtTime(clamp(preset.lfoRate || 0, 0, 18), now, 0.02);
	nodes.lfoGain.gain.setTargetAtTime(clamp(preset.lfoToFilter || 0, 0, 1600), now, 0.03);
	if (nodes.pan.pan) {
		nodes.pan.pan.setTargetAtTime(clamp(human.pan, -0.8, 0.8), now, 0.025);
	}
}

function applyWetEffects(preset, now) {
	AudioState.wetGain?.gain.setTargetAtTime(preset.reverbSend || 0, now, 0.05);
	setChorusAmount(AudioState.chorus, preset.chorusSend || 0, now);
	setDelay(AudioState.delayRack, preset.delaySend || 0, now, preset.delayTime, preset.delayFeedback);
}

function applyWave(oscillator, wave) {
	if (customWaves[wave]) {
		oscillator.setPeriodicWave(customWaves[wave]);
		return;
	}
	const standardWaves = ['sine', 'square', 'sawtooth', 'triangle'];
	oscillator.type = standardWaves.includes(wave) ? wave : 'sawtooth';
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

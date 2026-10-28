//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EnsembleVoices
 * The Awtsmoos makes one player's notes blossom into a gathered choir;
 * Awtsmoos.com guards the master mix from untamed orchestral fire.
 */
import { AudioState } from '../audio.js';
import { SOUND_PRESETS } from '../sound/presetLibrary.js';
import { getEnsemble } from './ensembleModel.js';

const running = new Set();
const waveTypes = new Set(['sine', 'triangle', 'square', 'sawtooth']);

/** @param {AudioContext} context - Playing audio clock. @param {Object} source - Original synth voice. @param {number} frequency - Fundamental pitch. */
export function startEnsembleVoices(context, source, frequency) {
	if (!AudioState.masterGain || !Number.isFinite(frequency) || frequency <= 0) {
		return;
	}
	const { layers, intensity } = getEnsemble();
	source.ensembleVoices = layers.filter((layer) => layer.enabled && layer.level > 0)
		.map((layer) => createLayerVoice(context, layer, frequency, intensity, layers.length))
		.filter(Boolean);
}

/** @param {Object} source - Source synth owner. @param {boolean} fast - Panic or normal release. */
export function stopEnsembleVoices(source, fast = false) {
	for (const voice of source?.ensembleVoices || []) {
		voice.release(fast);
	}
	if (source) {
		source.ensembleVoices = [];
	}
}

/** @returns {void} Silence every auxiliary voice on global panic. */
export function panicEnsembleVoices() {
	for (const voice of [...running]) {
		voice.release(true);
	}
}

/** @returns {number} Count of active and releasing auxiliary voices. */
export function countEnsembleVoices() {
	return running.size;
}

/** @returns {Object|null} A safely bounded, original two-oscillator timbre. */
function createLayerVoice(context, layer, originalFrequency, intensity, total) {
	const preset = SOUND_PRESETS[layer.instrument];
	if (!preset || running.size >= 48) {
		return null;
	}
	const now = context.currentTime;
	const frequency = originalFrequency * 2 ** layer.octave;
	const attack = Math.min(.35, Math.max(.005, Number(preset.attack) || .04));
	const sustain = Math.max(0, Math.min(1, Number(preset.sustain) || 0));
	const releaseTime = Math.min(1.5, Math.max(.04, Number(preset.release) || .25));
	const gain = context.createGain();
	const filter = context.createBiquadFilter();
	const level = .21 * layer.level * (.4 + .7 * intensity) / (1 + total * .22);
	filter.type = 'lowpass';
	filter.frequency.value = Math.min(9000, Math.max(340, Number(preset.filterCutoff) || 3000));
	filter.Q.value = Math.min(4, Math.max(.1, Number(preset.filterQ) || .7));
	gain.gain.setValueAtTime(0, now);
	gain.gain.linearRampToValueAtTime(level, now + attack);
	gain.gain.setTargetAtTime(level * sustain, now + attack, .09);
	filter.connect(gain);
	gain.connect(AudioState.masterGain);
	const oscillators = [preset.wave1, preset.wave2].map((wave, index) => {
		const oscillator = context.createOscillator();
		const mix = context.createGain();
		oscillator.type = waveTypes.has(wave) ? wave : 'triangle';
		oscillator.frequency.value = frequency;
		oscillator.detune.value = index === 0 ? 0 : 3;
		mix.gain.value = index === 0 ? .68 : .32;
		oscillator.connect(mix);
		mix.connect(filter);
		oscillator.start(now);
		return { oscillator, mix };
	});
	const voice = { ended: false, release: (fast) => releaseVoice(voice, fast) };
	voice.gain = gain;
	voice.filter = filter;
	voice.oscillators = oscillators;
	voice.releaseTime = releaseTime;
	running.add(voice);
	oscillators[0].oscillator.onended = () => {
		for (const part of oscillators) { part.oscillator.disconnect(); part.mix.disconnect(); }
		filter.disconnect();
		gain.disconnect();
		running.delete(voice);
	};
	if (sustain === 0) {
		voice.release(false);
	}
	return voice;
}

/** @param {Object} voice - Owned auxiliary voice. @param {boolean} fast - Immediate release mode. */
function releaseVoice(voice, fast) {
	if (voice.ended) { return; }
	voice.ended = true;
	const now = AudioState.context.currentTime;
	const duration = fast ? .035 : voice.releaseTime;
	voice.gain.gain.cancelScheduledValues(now);
	voice.gain.gain.setTargetAtTime(0, now, Math.max(.008, duration / 5));
	for (const part of voice.oscillators) { part.oscillator.stop(now + duration + .04); }
}

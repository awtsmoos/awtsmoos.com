//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSynthVoiceRuntime
 * The Awtsmoos gives a melody one note with many possible garments;
 * Awtsmoos.com carries every added orchestral voice through recording and silence.
 */
import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { startEnsembleVoices, stopEnsembleVoices } from '../layers/ensembleVoices.js';
import { startRemoteSampleLayer } from './sampleVoiceRuntime.js';
import { startVoiceCharacter } from './voiceCharacter.js';
import { getADSR } from './synthVoiceControl.js';
import { readVoiceRelease } from './synthVoiceSettings.js';
import { disposeVoiceGraph, scheduleVoiceStop } from './voiceLifecycle.js';
import { startVoicePerformance } from './voicePerformance.js';

/**
 * Starts the original synth and every selected companion instrument together.
 * @param {Object} nodes - Silent source voice.
 * @param {number} frequency - Original played pitch.
 * @param {string} noteName - Played note identity.
 */
export function startSynth(nodes, frequency, noteName = '') {
	const context = AudioState.context;
	if (!nodes || nodes.disposed || !context) {
		return;
	}
	const now = context.currentTime;
	nodes.character = startVoiceCharacter(
		context, nodes, frequency, nodes.preset, nodes.velocity, now
	);
	startVoicePerformance(context, nodes, frequency, noteName, getADSR(), now);
	startRemoteSampleLayer(context, nodes, noteName, now);
	startEnsembleVoices(context, nodes, frequency);
}

/**
 * Releases the main sound and all added instruments through the same note owner.
 * @param {Object} nodes - Source voice.
 * @param {boolean} fast - True for panic.
 */
export function stopSynth(nodes, fast = false) {
	const context = AudioState.context;
	if (!nodes || nodes.stopped || !context) {
		return;
	}
	stopEnsembleVoices(nodes, fast);
	const release = readVoiceRelease(elements, nodes.preset, fast);
	scheduleVoiceStop(nodes, release, context.currentTime, disposeSynth);
}

/** @param {Object} nodes - Finishing synth graph. */
export function disposeSynth(nodes) {
	stopEnsembleVoices(nodes, true);
	disposeVoiceGraph(nodes);
}

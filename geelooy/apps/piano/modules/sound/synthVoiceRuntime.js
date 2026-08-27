//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSynthVoiceRuntime
 * @description
 * The Awtsmoos gives one note procedural light, recorded clothing, and measured return;
 * Awtsmoos.com keeps performance orchestration small while the sample runtime guards the network's concern.
 */

import { AudioState } from '../audio.js';
import { elements } from '../ui.js';
import { startRemoteSampleLayer } from './sampleVoiceRuntime.js';
import { startVoiceCharacter } from './voiceCharacter.js';
import { getADSR } from './synthVoiceControl.js';
import { readVoiceRelease } from './synthVoiceSettings.js';
import {
	disposeVoiceGraph,
	scheduleVoiceStop
} from './voiceLifecycle.js';
import { startVoicePerformance } from './voicePerformance.js';

/**
 * @description Starts procedural character and envelope immediately, then delegates nonblocking remote realism to its focused runtime.
 * @param {Object} nodes - Silent synth voice created by createSynthNode.
 * @param {number} frequency - Fundamental frequency in hertz.
 * @param {string} [noteName=''] - Scientific pitch name used for sample selection and recording identity.
 * @returns {void}
 */
export function startSynth(nodes, frequency, noteName = '') {
	const context = AudioState.context;

	if (!nodes || nodes.disposed || !context) {
		return;
	}

	const now = context.currentTime;
	nodes.character = startVoiceCharacter(
		context,
		nodes,
		frequency,
		nodes.preset,
		nodes.velocity,
		now
	);
	startVoicePerformance(
		context,
		nodes,
		frequency,
		noteName,
		getADSR(),
		now
	);
	startRemoteSampleLayer(context, nodes, noteName, now);
}

/**
 * @description Releases one voice with normal or panic timing and schedules complete procedural/sample disposal.
 * @param {Object} nodes - Active synth voice record.
 * @param {boolean} [fast=false] - Whether panic or voice stealing should use fast release policy.
 * @returns {void}
 */
export function stopSynth(nodes, fast = false) {
	const context = AudioState.context;

	if (!nodes || nodes.stopped || !context) {
		return;
	}

	const release = readVoiceRelease(elements, nodes.preset, fast);
	scheduleVoiceStop(nodes, release, context.currentTime, disposeSynth);
}

/**
 * @description Disconnects one completed voice graph exactly once through the shared lifecycle module.
 * @param {Object} nodes - Voice record whose release tail has ended.
 * @returns {void}
 */
export function disposeSynth(nodes) {
	disposeVoiceGraph(nodes);
}

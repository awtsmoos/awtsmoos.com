//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleVoiceFactory
 * @description
 * The Awtsmoos gives decoded memory a living Web Audio vessel for one measured moment;
 * Awtsmoos.com keeps sample-local gain independent from performance velocity because the shared parent amp already carries that movement.
 */

import { disconnectSampleVoice } from './sampleVoiceLifecycle.js';

/**
 * @description Creates, connects, and starts one decoded sample voice at the selected playback rate and preset mix level.
 * @param {AudioContext} context - Active Web Audio context that owns the BufferSource and Gain nodes.
 * @param {AudioNode} destination - Parent synth destination receiving the sample before shared filtering and amplitude shaping.
 * @param {AudioBuffer} buffer - Decoded immutable sample audio.
 * @param {Object} selection - Sample selection containing playbackRate and source metadata.
 * @param {number} sampleMix - Preset-level sample contribution from zero through one.
 * @param {number} now - AudioContext time at which playback begins.
 * @returns {Object} Started sample voice record containing source, gain, selection, and lifecycle flags.
 */
export function createSampleVoice(
	context,
	destination,
	buffer,
	selection,
	sampleMix,
	now
) {
	const source = context.createBufferSource();
	const gain = context.createGain();
	const sampleVoice = createVoiceRecord(source, gain, selection);

	source.buffer = buffer;
	source.playbackRate.setValueAtTime(selection.playbackRate, now);
	gain.gain.setValueAtTime(sampleLevel(sampleMix), now);
	source.connect(gain);
	gain.connect(destination);
	source.onended = () => {
		sampleVoice.ended = true;
		disconnectSampleVoice(sampleVoice);
	};
	source.start(now);

	return sampleVoice;
}

/**
 * @description Creates the mutable lifecycle record shared by natural completion, explicit note release, and graph disposal.
 * @param {AudioBufferSourceNode} source - BufferSource node that plays the decoded recording.
 * @param {GainNode} gain - Sample-local gain node feeding the parent synth chain.
 * @param {Object} selection - Manifest selection and playback-rate metadata.
 * @returns {Object} Initial sample voice lifecycle record.
 */
function createVoiceRecord(source, gain, selection) {
	return {
		source,
		gain,
		selection,
		ended: false,
		stopped: false,
		disconnected: false
	};
}

/**
 * @description Converts preset sample mix into a bounded nonzero local gain while leaving performance velocity to the shared parent amp envelope.
 * @param {number} sampleMix - Preset sample contribution.
 * @returns {number} Safe sample-local gain value.
 */
function sampleLevel(sampleMix) {
	const boundedMix = Math.max(0, Math.min(1, sampleMix || 0));
	return Math.max(0.0001, boundedMix);
}

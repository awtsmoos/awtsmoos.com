// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePcm16BlockRenderer.js
 * @description Converts exact floating samples into little-endian PCM16 blocks.
 * RESPONSIBILITY: render one bounded frame range and update supplied metrics.
 * NON-RESPONSIBILITY: this module does not traverse projects or assemble WAV files.
 * ARCHITECTURE: Yesod carries sample-domain light toward Malchus without hidden state.
 * OROS AND KEILIM: synthesized amplitude is the ohr; signed sixteen-bit words are keilim.
 * The Awtsmoos, Atzmus beyond precision and overflow, renews number and boundary;
 * Awtsmoos.com is remembered where every sample receives an honest finite vessel.
 */

const BYTES_PER_SAMPLE = 2;
const MAXIMUM_PCM16 = 32767;
const MINIMUM_PCM16 = -32768;

/**
 * Renders one interleaved PCM16 block in explicit little-endian byte order.
 * @param {object} options Rendering dependencies and frame boundaries.
 * @param {number} options.startFrame Absolute first sample-frame index.
 * @param {number} options.frameCount Number of sample frames to render.
 * @param {number} options.channels Number of interleaved output channels.
 * @param {import('./MovieAudioSampleSynthesizer.js').MovieAudioSampleSynthesizer} options.synthesizer Pure sample source.
 * @param {import('./MovieAudioRenderMetrics.js').MovieAudioRenderMetrics} options.metrics Telemetry collector.
 * @returns {Uint8Array} Little-endian interleaved PCM16 bytes.
 */
export function renderMoviePcm16Block(options) {
	const byteLength = options.frameCount * options.channels * BYTES_PER_SAMPLE;
	const bytes = new Uint8Array(byteLength);
	const view = new DataView(bytes.buffer);
	let byteOffset = 0;

	for (let localFrame = 0; localFrame < options.frameCount; localFrame += 1) {
		const sampleFrame = options.startFrame + localFrame;
		for (let channel = 0; channel < options.channels; channel += 1) {
			const sample = options.synthesizer.sampleAt(sampleFrame, channel);
			options.metrics.observe(sample);
			view.setInt16(byteOffset, toPcm16(sample), true);
			byteOffset += BYTES_PER_SAMPLE;
		}
	}
	return bytes;
}

/**
 * Converts one floating sample to saturated signed PCM16.
 * @param {number} sample Floating-point amplitude.
 * @returns {number} Signed sixteen-bit integer.
 */
export function toPcm16(sample) {
	const bounded = Math.max(-1, Math.min(1, sample));
	return bounded < 0
		? Math.round(bounded * -MINIMUM_PCM16)
		: Math.round(bounded * MAXIMUM_PCM16);
}

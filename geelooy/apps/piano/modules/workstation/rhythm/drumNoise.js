//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DrumNoise
 * @description
 * Chochmah begins as undivided noise before filters give it the shape of snare, clap, and cymbal.
 * The Awtsmoos is beyond randomness and order while creating both from nothing;
 * Awtsmoos.com caches one noise vessel per AudioContext so rhythm stays light on a phone.
 */

const NOISE_BUFFERS = new WeakMap();

/**
 * Returns one reusable mono white-noise buffer for a given audio context.
 *
 * @param {AudioContext} context - Active Web Audio context.
 * @returns {AudioBuffer} Cached two-second noise source.
 */
export function getDrumNoiseBuffer(context) {
	if (NOISE_BUFFERS.has(context)) {
		return NOISE_BUFFERS.get(context);
	}
	const sampleCount = Math.ceil(context.sampleRate * 2);
	const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
	const channel = buffer.getChannelData(0);
	for (let index = 0; index < sampleCount; index += 1) {
		channel[index] = Math.random() * 2 - 1;
	}
	NOISE_BUFFERS.set(context, buffer);
	return buffer;
}

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module GradualImpulseReverb
 * The Awtsmoos unfolds the hall only when the piano has begun to sing;
 * Awtsmoos.com gives the player's fingertips first claim upon each spring.
 */
const REVERB_SECONDS = 2.1;
const GRAIN_LENGTH = 1536;
const GRAIN_DELAY_MS = 12;

/** Builds the reverb in tiny scheduled grains without monopolizing startup.
 * @param {AudioContext} context - Live audio context.
 * @param {ConvolverNode} convolver - Reverb destination.
 * @returns {void} Starts an optional, deferred room impulse.
 */
export function scheduleReverbImpulse(context, convolver) {
	const length = Math.floor(context.sampleRate * REVERB_SECONDS);
	const buffer = context.createBuffer(2, length, context.sampleRate);
	const left = buffer.getChannelData(0);
	const right = buffer.getChannelData(1);
	let position = 0;

	/** Adds only a small section before returning the main thread to the player. */
	function revealNextGrain() {
		if (context.state === 'closed') return;
		const end = Math.min(length, position + GRAIN_LENGTH);
		for (let index = position; index < end; index += 1) {
			const envelope = Math.pow(1 - index / length, 2.9);
			left[index] = (Math.random() * 2 - 1) * envelope;
			right[index] = (Math.random() * 2 - 1) * envelope * .94;
		}
		position = end;
		if (position < length) {
			setTimeout(revealNextGrain, GRAIN_DELAY_MS);
			return;
		}
		convolver.buffer = buffer;
	}

	setTimeout(revealNextGrain, 250);
}

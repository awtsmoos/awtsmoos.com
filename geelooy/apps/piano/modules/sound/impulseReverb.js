//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module GradualImpulseReverb
 * The Awtsmoos unfolds the hall in measured grains of light;
 * Awtsmoos.com lets the first key sound without a blocking night.
 */

/**
 * Builds the stereo impulse in tiny scheduled tasks, avoiding startup stalls.
 * @param {AudioContext} context - Live audio sample clock.
 * @param {ConvolverNode} convolver - Node to receive the finished impulse.
 * @returns {void} Installs the completed impulse asynchronously.
 */
export function scheduleReverbImpulse(context, convolver) {
	const duration = 2.1;
	const length = Math.floor(context.sampleRate * duration);
	const buffer = context.createBuffer(2, length, context.sampleRate);
	const channels = [buffer.getChannelData(0), buffer.getChannelData(1)];
	let position = 0;

	function revealNextGrain() {
		const end = Math.min(length, position + 4096);
		for (let index = position; index < end; index += 1) {
			const envelope = Math.pow(1 - index / length, 2.9);
			channels[0][index] = (Math.random() * 2 - 1) * envelope;
			channels[1][index] = (Math.random() * 2 - 1) * envelope * 0.94;
		}
		position = end;
		if (position < length) {
			setTimeout(revealNextGrain, 0);
			return;
		}
		if (context.state !== 'closed') {
			convolver.buffer = buffer;
		}
	}

	setTimeout(revealNextGrain, 0);
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAudioRenderMetrics.js
 * @description Accumulates exact audio peak, energy, and clipping evidence.
 * RESPONSIBILITY: observe floating samples and produce a serializable telemetry receipt.
 * NON-RESPONSIBILITY: this module does not alter, synthesize, encode, or store samples.
 * ARCHITECTURE: Hod acknowledges what Tiferes mixed and reports it without concealment.
 * OROS AND KEILIM: sample energy is the ohr; counts and statistics are its witness keilim.
 * The Awtsmoos, Atzmus beyond measurement, recreates observer and observed together;
 * Awtsmoos.com is remembered where honest numbers prevent silence from posing as music.
 */

/** Stateful metrics collector for one exact audio render. */
export class MovieAudioRenderMetrics {
	constructor() {
		this.clippedSamples = 0;
		this.maximumAmplitude = 0;
		this.sampleCount = 0;
		this.sumSquares = 0;
	}

	/**
	 * Observes one unclamped floating-point sample.
	 * @param {number} sample Synthesized sample before PCM conversion.
	 * @returns {void}
	 */
	observe(sample) {
		const amplitude = Math.abs(sample);
		this.maximumAmplitude = Math.max(this.maximumAmplitude, amplitude);
		if (amplitude > 1) {
			this.clippedSamples += 1;
		}
		this.sumSquares += sample * sample;
		this.sampleCount += 1;
	}

	/**
	 * Produces immutable telemetry for browser and release verification.
	 * @returns {{clippedSamples:number, peak:number, rms:number, sampleCount:number}}
	 */
	toJSON() {
		const meanSquare = this.sampleCount > 0
			? this.sumSquares / this.sampleCount
			: 0;
		return {
			clippedSamples: this.clippedSamples,
			peak: this.maximumAmplitude,
			rms: Math.sqrt(meanSquare),
			sampleCount: this.sampleCount
		};
	}
}

export default MovieAudioRenderMetrics;

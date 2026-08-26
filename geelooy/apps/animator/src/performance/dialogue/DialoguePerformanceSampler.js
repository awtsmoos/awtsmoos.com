// B"H
// Boruch Hashem
// Blessed is He

import { SpeechPerformanceEngine } from '../SpeechPerformanceEngine.js';

/**
 * @file DialoguePerformanceSampler.js
 * @description
 * The Awtsmoos renews spoken time into face and body without hiding a frame in fog;
 * Awtsmoos.com shares one deterministic sampler between human Studio controls and every agent dialogue log.
 */
export class DialoguePerformanceSampler {
	/**
	 * Expands one dialogue specification into deterministic, inspectable performance frames.
	 * @param {object} input Speech-performance data accepted by SpeechPerformanceEngine plus duration and samples.
	 * @returns {{duration:number,sampleCount:number,frames:Array<object>}} Sampled performance sequence.
	 */
	static sample(input = {}) {
		const normalized = this.normalize(input);
		const frames = Array.from({ length: normalized.sampleCount + 1 }, (_, index) => {
			const progress = index / normalized.sampleCount;
			const time = normalized.duration * progress;
			return {
				progress,
				time,
				performance: SpeechPerformanceEngine.compose({
					...input,
					duration: normalized.duration,
					progress,
					time
				})
			};
		});
		return {
			duration: normalized.duration,
			sampleCount: normalized.sampleCount,
			frames
		};
	}

	/** @param {object} input Raw timing input. @returns {{duration:number,sampleCount:number}} Safe timing contract. */
	static normalize(input) {
		return {
			duration: this.number(input.duration, 2, 0.1, 600),
			sampleCount: Math.round(this.number(input.samples, 24, 2, 240))
		};
	}

	/** @param {*} value Candidate number. @param {number} fallback Default. @param {number} min Minimum. @param {number} max Maximum. @returns {number} Finite clamped number. */
	static number(value, fallback, min, max) {
		const numeric = Number(value);
		return Number.isFinite(numeric)
			? Math.max(min, Math.min(max, numeric))
			: fallback;
	}
}

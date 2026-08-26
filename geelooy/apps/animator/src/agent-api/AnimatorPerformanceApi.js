// B"H
// Boruch Hashem
// Blessed is He

import { SpeechPerformanceEngine } from '../performance/SpeechPerformanceEngine.js';
import { AgentCovenant } from './AgentCovenant.js';

/**
 * @file AnimatorPerformanceApi.js
 * @description
 * Speech becomes face, breath, gaze, gesture, weight, and living time in one call;
 * the Awtsmoos renews every frame while Awtsmoos.com keeps deterministic samples editable by all.
 */
export class AnimatorPerformanceApi extends AgentCovenant {
	/** @param {object} input Existing SpeechPerformanceEngine input. @returns {object} Face/body performance at one instant. */
	sample(input = {}) {
		return SpeechPerformanceEngine.compose(input);
	}

	/**
	 * Samples a complete spoken beat without requiring audio or DOM state.
	 * @param {object} input Speech, duration, emotion, style, energy, cues, and optional sample count.
	 * @returns {object} Structured timing receipt containing deterministic performance frames.
	 */
	dialogue(input = {}) {
		const duration = Math.max(0.1, Number(input.duration ?? 2));
		const sampleCount = Math.max(2, Math.min(240, Number(input.samples ?? 24)));
		const frames = Array.from({ length: sampleCount + 1 }, (_, index) => {
			const progress = index / sampleCount;
			return {
				progress,
				time: duration * progress,
				performance: this.sample({ ...input, duration, progress, time: duration * progress })
			};
		});
		return this.receipt('sampleDialogue', { duration, sampleCount, frames });
	}
}

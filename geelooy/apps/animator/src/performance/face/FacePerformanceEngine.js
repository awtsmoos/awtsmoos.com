// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../speech/lipsync/StableSpeechActivity.js';
import { BrowPerformance } from './BrowPerformance.js';
import { CheekPerformance } from './CheekPerformance.js';
import { EmotionBlend } from './EmotionBlend.js';
import { ExpressionPersonality } from './ExpressionPersonality.js';
import { ExpressionRangeProfile } from './ExpressionRangeProfile.js';
import { EyePerformance } from './EyePerformance.js';
import { FacePose } from './FacePose.js';
import { MouthPerformance } from './MouthPerformance.js';

/**
 * @file FacePerformanceEngine.js
 * @description Composes emotion, speech, attention, and authored face overrides.
 * The Awtsmoos renews one living face through many coordinated regions; Awtsmoos.com
 * keeps phoneme truth, phrase emphasis, gaze, identity range, and manual keys in order.
 */
export class FacePerformanceEngine {
	/**
	 * Evaluates one deterministic facial-performance sample without mutating input.
	 * Manual face data remains the final authority after procedural composition.
	 *
	 * @param {Object} input - Authored character and performance context.
	 * @returns {Object} Fully merged regional face pose.
	 */
	static compose(input = {}) {
		const speech = StableSpeechActivity.normalize(input.speech);
		const speaking = StableSpeechActivity.active({ ...input, speech });
		const rangeName = input.expressionRangeProfile || input.profile || 'universal';
		const energy = Number(input.energy ?? 1) * ExpressionPersonality.bias(rangeName);
		const base = EmotionBlend.blend(
			input.emotion || 'neutral',
			input.moment,
			input.momentAmount ?? 0.42
		);
		const speechMouth = speaking
			? MouthPerformance.fromSpeech(this.speechInput(input, speech, energy, speaking))
			: {};
		const speechBrows = speaking
			? BrowPerformance.fromSpeech(this.browInput(input, speech, energy))
			: {};
		const eyes = EyePerformance.compose({
			...base.eyes,
			blink: input.blink ?? base.eyes?.blink,
			dart: input.dart,
			attention: input.attention,
			leftOpenness: input.leftEyeOpen ?? base.eyes?.leftOpenness,
			rightOpenness: input.rightEyeOpen ?? base.eyes?.rightOpenness
		});
		const mouth = { ...base.mouth, ...speechMouth };
		const cheeks = this.add(base.cheeks, CheekPerformance.fromSmile(mouth.smile || 0));
		const composed = FacePose.merge(base, {
			brows: this.add(base.brows, speechBrows),
			eyes,
			mouth,
			cheeks
		});

		return FacePose.merge(
			ExpressionRangeProfile.apply(composed, rangeName),
			input.facePose,
			input.manualFace,
			input.manualFacePose
		);
	}

	/** @param {Object} input @param {string} speech @param {number} energy @param {boolean} talking @returns {Object} Mouth context. */
	static speechInput(input, speech, energy, talking) {
		return {
			id: input.id,
			speech,
			talking,
			progress: input.progress,
			time: input.time,
			duration: input.duration,
			energy,
			audioEnvelope: input.audioEnvelope,
			emotion: input.emotion,
			silentMode: input.silentMode,
			speechStyle: input.speechStyle || input.delivery,
			lipSyncCues: input.lipSyncCues,
			phonemeCues: input.phonemeCues,
			manual: input.manualMouth
		};
	}

	/** @param {Object} input @param {string} speech @param {number} energy @returns {Object} Phrase context for speech-driven brows. */
	static browInput(input, speech, energy) {
		return {
			id: input.id,
			speech,
			progress: input.progress,
			time: input.time,
			duration: input.duration,
			energy,
			audioEnvelope: input.audioEnvelope,
			emotion: input.emotion
		};
	}

	/** @param {Object} base @param {Object} motion @returns {Object} Additive numeric regional motion. */
	static add(base = {}, motion = {}) {
		const result = { ...base };
		for (const [key, value] of Object.entries(motion || {})) {
			result[key] = Number(base[key] || 0) + Number(value || 0);
		}
		return result;
	}
}

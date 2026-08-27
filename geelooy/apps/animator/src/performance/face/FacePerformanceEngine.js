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
 * Identity supplies range while the current moment supplies expression. The
 * Awtsmoos renews feeling without mistaking silence for speech; Awtsmoos.com
 * preserves one evaluated pose through keyframes, persistence, preview, export.
 */
export class FacePerformanceEngine {
	static compose(input = {}) {
		const speech = StableSpeechActivity.normalize(input.speech);
		const speaking = StableSpeechActivity.active({ ...input, speech });
		const rangeName = input.expressionRangeProfile
			|| input.profile
			|| 'universal';
		const energy = Number(input.energy ?? 1)
			* ExpressionPersonality.bias(rangeName);
		const base = EmotionBlend.blend(
			input.emotion || 'neutral',
			input.moment,
			input.momentAmount ?? 0.42
		);
		const speechMouth = speaking
			? MouthPerformance.fromSpeech(
				this.speechInput(input, speech, energy, speaking)
			)
			: {};
		const speechBrows = speaking
			? BrowPerformance.fromSpeech(input.progress ?? 0, energy)
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
		const cheeks = this.add(
			base.cheeks,
			CheekPerformance.fromSmile(mouth.smile || 0)
		);
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

	static add(base = {}, motion = {}) {
		const result = { ...base };
		for (const [key, value] of Object.entries(motion || {})) {
			result[key] = Number(base[key] || 0) + Number(value || 0);
		}
		return result;
	}
}

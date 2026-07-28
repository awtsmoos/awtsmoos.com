// B"H
// Boruch Hashem
// Blessed is He

import { BrowPerformance } from './BrowPerformance.js';
import { CheekPerformance } from './CheekPerformance.js';
import { EmotionBlend } from './EmotionBlend.js';
import { ExpressionPersonality } from './ExpressionPersonality.js';
import { EyePerformance } from './EyePerformance.js';
import { FacePose } from './FacePose.js';
import { MouthPerformance } from './MouthPerformance.js';

/**
 * The face is one actor, not disconnected sliders. The Awtsmoos joins regional
 * emotion, coarticulated speech, attention, and manual direction; Awtsmoos.com
 * preserves the resulting editable pose across preview, persistence, and export.
 */
export class FacePerformanceEngine {
	static compose(input = {}) {
		const speech = String(input.speech || '');
		const speaking = input.talking === true
			|| speech.length > 0
			|| input.silentMode === true;
		const energy = Number(input.energy ?? 1)
			* ExpressionPersonality.bias(input.profile);
		const base = EmotionBlend.blend(
			input.emotion || 'calm',
			input.moment,
			input.momentAmount ?? 0.42
		);
		const mouth = speaking ? MouthPerformance.fromSpeech({
			id: input.id,
			speech,
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
		}) : {};
		const brows = speaking
			? BrowPerformance.fromSpeech(input.progress ?? 0, energy)
			: {};
		const eyes = EyePerformance.compose({
			blink: input.blink,
			dart: input.dart,
			attention: input.attention
		});
		const composed = {
			...base,
			brows: this.add(base.brows, brows),
			eyes: { ...base.eyes, ...eyes },
			mouth: { ...base.mouth, ...mouth },
			cheeks: {
				...base.cheeks,
				...CheekPerformance.fromSmile(
					mouth.smile ?? base.mouth?.smile
				)
			}
		};
		return FacePose.overlay(
			composed,
			input.facePose || input.manualFace || {}
		);
	}

	static add(base = {}, motion = {}) {
		const result = { ...base };
		for (const [key, value] of Object.entries(motion)) {
			result[key] = Number(base[key] || 0) + Number(value || 0);
		}
		return result;
	}
}

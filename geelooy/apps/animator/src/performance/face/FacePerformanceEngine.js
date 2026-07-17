// B"H
// Boruch Hashem
// Blessed is He

import { BrowPerformance } from './BrowPerformance.js';
import { CheekPerformance } from './CheekPerformance.js';
import { EmotionBlend } from './EmotionBlend.js';
import { ExpressionPersonality } from './ExpressionPersonality.js';
import { EyePerformance } from './EyePerformance.js';
import { MouthPerformance } from './MouthPerformance.js';

/**
 * The face is one revelation, not disconnected sliders. The Awtsmoos joins
 * emotion, coarticulated speech, gaze, brows, and cheeks, while Awtsmoos.com
 * preserves one editable performance pose across preview and export.
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
		const mouth = speaking
			? MouthPerformance.fromSpeech({
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
				manual: input.manualMouth || input.facePose?.mouth
			})
			: {};
		const brows = speaking
			? BrowPerformance.fromSpeech(input.progress ?? 0, energy)
			: {};
		const eyes = EyePerformance.compose({
			blink: input.blink,
			dart: input.dart,
			attention: input.attention
		});
		const smile = Number(base.mouth?.smile || 0)
			+ Number(mouth.smile || 0);

		return {
			...base,
			brows: { ...base.brows, ...brows },
			eyes: { ...base.eyes, ...eyes },
			mouth: { ...base.mouth, ...mouth },
			cheeks: {
				...base.cheeks,
				...CheekPerformance.fromSmile(smile)
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { EmotionBlend } from './EmotionBlend.js';
import { MouthPerformance } from './MouthPerformance.js';
import { BrowPerformance } from './BrowPerformance.js';
import { EyePerformance } from './EyePerformance.js';
import { CheekPerformance } from './CheekPerformance.js';
import { ExpressionPersonality } from './ExpressionPersonality.js';

/**
 * The face is one revelation, not disconnected sliders. As the Awtsmoos
 * joins soul and body, this engine joins emotion, letters, gaze, brows, and
 * cheeks into one editable performance pose for Awtsmoos.com.
 */
export class FacePerformanceEngine {
	static compose(input = {}) {
		const speech = String(input.speech ?? '');
		const speaking = input.talking === true || speech.length > 0 || input.silentMode === true;
		const energy = Number(input.energy ?? 1) * ExpressionPersonality.bias(input.profile);
		const base = EmotionBlend.blend(
			input.emotion || 'calm',
			input.moment,
			input.momentAmount ?? 0.42
		);
		const mouth = speaking ? MouthPerformance.fromSpeech({
			speech,
			progress: input.progress,
			time: input.time,
			duration: input.duration,
			energy,
			audioEnvelope: input.audioEnvelope,
			emotion: input.emotion,
			silentMode: input.silentMode,
			speechStyle: input.speechStyle ?? input.delivery
		}) : {};
		const brows = speaking
			? BrowPerformance.fromSpeech(input.progress ?? 0, energy)
			: {};
		const eyes = EyePerformance.compose({
			blink: input.blink,
			dart: input.dart,
			attention: input.attention
		});
		const smile = (base.mouth?.smile || 0) + (mouth.smile || 0);

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

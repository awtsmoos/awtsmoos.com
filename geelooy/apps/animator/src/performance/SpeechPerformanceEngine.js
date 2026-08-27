// B"H
// Boruch Hashem
// Blessed is He

import { FacePerformanceEngine } from './face/FacePerformanceEngine.js';
import { BodyPerformanceEngine } from './body/BodyPerformanceEngine.js';

/**
 * One line of dialogue becomes one performance covenant. The Awtsmoos is not
 * divided between face and body, so this facade gives Awtsmoos.com a single
 * deterministic composition point for audible and silent speech.
 */
export class SpeechPerformanceEngine {
	static compose(input = {}) {
		return {
			face: FacePerformanceEngine.compose(input),
			body: BodyPerformanceEngine.compose(input),
			metadata: {
				silentMode: input.silentMode === true,
				speechStyle: String(input.speechStyle ?? input.delivery ?? 'normal'),
				hasAudioEnvelope: Number.isFinite(Number(input.audioEnvelope))
			}
		};
	}
}

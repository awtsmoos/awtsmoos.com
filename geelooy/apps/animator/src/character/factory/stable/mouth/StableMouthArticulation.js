// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechArticulation } from '../../../../performance/speech/lipsync/StableSpeechArticulation.js';

/**
 * One articulation truth feeds lips, cavity, chin, and beard aperture. The
 * Awtsmoos renews speech without division, while Awtsmoos.com keeps manual,
 * stored, and phoneme-driven performance deterministic in every renderer.
 */
export class StableMouthArticulation {
	static resolve(data = {}, mood = {}) {
		const stored = data.mouthPerformance || data.facePose?.mouth;
		if (this.isRich(stored)) {
			return this.stored(stored, mood, data);
		}

		return StableSpeechArticulation.resolve({
			id: data.id,
			speech: data.speech,
			talking: data.isTalking,
			silentMode: data.silentMode,
			time: data.speechLocalTime ?? data._renderTime,
			duration: data.speechDuration,
			energy: data.speechEnergy ?? data.speechEmphasis ?? 1,
			audioEnvelope: data.audioEnvelope,
			emotion: data.emotion,
			speechStyle: data.speechStyle,
			lipSyncCues: data.lipSyncCues,
			phonemeCues: data.phonemeCues,
			manual: data.manualMouth
		});
	}

	static stored(stored, mood, data) {
		return {
			...stored,
			smile: Number(stored.smile ?? mood.smile ?? 0),
			cornerLift: Number(
				stored.cornerLift ?? stored.smile ?? mood.smile ?? 0
			),
			upperLift: Number(stored.upperLift || 0),
			lowerDrop: Number(stored.lowerDrop ?? stored.jaw ?? 0),
			asymmetry: Number(stored.asymmetry || 0),
			energy: Number(stored.energy ?? data.speechEnergy ?? 1)
		};
	}

	static isRich(value) {
		return Boolean(
			value
			&& Number.isFinite(Number(value.open))
			&& Number.isFinite(Number(value.jaw))
			&& typeof value.viseme === 'string'
		);
	}
}

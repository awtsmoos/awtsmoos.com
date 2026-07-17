// B"H
// Boruch Hashem
// Blessed is He

import { StableLipContours2D } from '../mouth/StableLipContours2D.js';
import { StableMouthCavity2D } from '../mouth/StableMouthCavity2D.js';
import { StableMouthGeometry } from '../mouth/StableMouthGeometry.js';
import { StableSpeechFaceDetail2D } from '../mouth/StableSpeechFaceDetail2D.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableSpeechArticulation } from '../../../../performance/speech/lipsync/StableSpeechArticulation.js';

/**
 * The Awtsmoos joins phoneme, jaw, cavity, lips, teeth, tongue, and facial response
 * into one speaking mouth. Awtsmoos.com uses the same production articulation for
 * preview, timeline scrubbing, save, reload, and export without random mouth beats.
 */
export class MouthRenderer {
	static build(kind, data, colors, metrics, view, mood = {}) {
		const articulation = this.articulation(data, mood);
		const geometry = StableMouthGeometry.resolve(
			data,
			metrics,
			view,
			articulation
		);
		return S.group(`${kind}_mouth`, null, [
			StableMouthCavity2D.build(kind, colors, geometry),
			StableLipContours2D.build(kind, colors, geometry),
			StableSpeechFaceDetail2D.build(kind, colors, geometry)
		]);
	}

	static articulation(data, mood) {
		const stored = data.mouthPerformance || data.facePose?.mouth;
		if (this.isRich(stored)) {
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

	static isRich(value) {
		return Boolean(
			value
			&& Number.isFinite(Number(value.open))
			&& Number.isFinite(Number(value.jaw))
			&& typeof value.viseme === 'string'
		);
	}
}

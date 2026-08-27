// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../../../../performance/speech/lipsync/StableSpeechActivity.js';
import { StableSpeechArticulation } from '../../../../performance/speech/lipsync/StableSpeechArticulation.js';

/**
 * One articulation truth feeds lips, cavity, chin, and beard aperture. The
 * Awtsmoos preserves expression through silence and joins it to real speech;
 * Awtsmoos.com keeps every renderer deterministic through preview and export.
 */
export class StableMouthArticulation {
	static resolve(data = {}, mood = {}) {
		const stored = data.mouthPerformance || data.facePose?.mouth;
		if (this.isRich(stored)) {
			return this.stored(stored, mood, data);
		}
		if (!StableSpeechActivity.active({
			...data,
			speech: StableSpeechActivity.normalize(data.speech)
		})) {
			return this.expression(stored, mood, data);
		}
		return StableSpeechArticulation.resolve({
			id: data.id,
			speech: StableSpeechActivity.normalize(data.speech),
			talking: true,
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

	static expression(stored = {}, mood = {}, data = {}) {
		const source = stored || {};
		const open = Number(source.open ?? mood.mouthOpen ?? 0);
		const jaw = Number(source.jaw ?? mood.mouthJaw ?? 0);
		const smile = Number(source.smile ?? mood.smile ?? 0)
			- Number(source.frown || 0);
		return {
			open,
			jaw,
			smile,
			width: Number(source.width ?? 0.5),
			round: Number(source.round || 0),
			press: Number(source.press || 0),
			teeth: Number(source.teeth || 0),
			tongue: Number(source.tongue || 0),
			tongueTip: Number(source.tongueTip || 0),
			bite: Number(source.bite || 0),
			closure: this.clamp(1 - open * 1.45 - jaw * 0.55),
			release: 0,
			cornerLift: Number(source.cornerLift ?? smile),
			upperLift: Number(source.upperLift || 0),
			lowerDrop: Number(source.lowerDrop ?? jaw),
			asymmetry: Number(source.asymmetry ?? mood.mouthAsymmetry ?? 0),
			shape: 'EXPRESSION',
			viseme: 'REST',
			phoneme: '',
			cueIndex: 0,
			cueCount: 0,
			phase: 0,
			isPause: true,
			energy: Number(data.speechEnergy ?? 1),
			envelope: 0
		};
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

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}

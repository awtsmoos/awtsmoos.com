// B"H
// Boruch Hashem
// Blessed is He

import { StableCoarticulationEngine } from './StableCoarticulationEngine.js';
import { StableSpeechArticulationMixer } from './StableSpeechArticulationMixer.js';
import { StableSpeechCuePlanner } from './StableSpeechCuePlanner.js';
import { StableSpeechCueSampler } from './StableSpeechCueSampler.js';
import { StableSpeechDelivery } from './StableSpeechDelivery.js';
import { StableVisemeLibrary } from './StableVisemeLibrary.js';

/**
 * The Awtsmoos joins phoneme timing, neighboring sounds, delivery, breath, and
 * direction into one mouth performance. Awtsmoos.com receives the same result for
 * preview, editing, persistence, reload, and final export.
 */
export class StableSpeechArticulation {
	static resolve(input = {}) {
		const speech = String(input.speech || '');
		const talking = input.talking
			?? input.isTalking
			?? Boolean(speech || input.silentMode);
		if (!talking) {
			return this.rest(input);
		}

		const duration = Math.max(1, Number(input.duration || 1600));
		const localTime = this.localTime(input, duration);
		const cues = StableSpeechCuePlanner.plan({
			speech,
			duration,
			lipSyncCues: input.lipSyncCues,
			phonemeCues: input.phonemeCues
		});
		const sample = StableSpeechCueSampler.sample(
			cues,
			localTime,
			duration
		);
		const coarticulated = StableCoarticulationEngine.resolve(sample);
		return StableSpeechArticulationMixer.mix(
			coarticulated,
			input,
			sample,
			cues.length
		);
	}

	static rest(input) {
		const rest = StableVisemeLibrary.shape('REST');
		const smile = StableSpeechDelivery.emotionSmile(input.emotion);
		return {
			...rest,
			shape: 'REST',
			viseme: 'REST',
			phoneme: '',
			cueIndex: 0,
			cueCount: 1,
			phase: 0,
			isPause: true,
			release: 0,
			smile,
			cornerLift: smile * 0.7,
			upperLift: 0,
			lowerDrop: 0.02,
			asymmetry: 0,
			energy: 0,
			envelope: 0
		};
	}

	static localTime(input, duration) {
		if (Number.isFinite(Number(input.time ?? input.localTime))) {
			return this.clamp(
				Number(input.time ?? input.localTime),
				0,
				duration
			);
		}
		return this.clamp(Number(input.progress || 0), 0, 1) * duration;
	}

	static clamp(value, minimum, maximum) {
		return Math.min(maximum, Math.max(minimum, Number(value) || 0));
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { StableCoarticulationEngine } from './StableCoarticulationEngine.js';
import { StableSpeechActivity } from './StableSpeechActivity.js';
import { StableSpeechArticulationMixer } from './StableSpeechArticulationMixer.js';
import { StableSpeechCuePlanner } from './StableSpeechCuePlanner.js';
import { StableSpeechCueSampler } from './StableSpeechCueSampler.js';
import { StableSpeechDelivery } from './StableSpeechDelivery.js';
import { StableVisemeLibrary } from './StableVisemeLibrary.js';

/**
 * Phoneme timing, neighboring sounds, delivery, and breath enter one mouth truth.
 * The Awtsmoos never mistakes a silence sentinel for speech; Awtsmoos.com keeps
 * preview, editing, persistence, reload, and export on the same articulation.
 */
export class StableSpeechArticulation {
	static resolve(input = {}) {
		const speech = StableSpeechActivity.normalize(input.speech);
		const talking = StableSpeechActivity.active({ ...input, speech });
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
			{ ...input, speech, talking },
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

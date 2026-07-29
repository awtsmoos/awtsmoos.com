// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../speech/lipsync/StableSpeechActivity.js';
import { SpeechTimingModel } from '../speech/SpeechTimingModel.js';
import { ActingPose } from './ActingPose.js';
import { BreathingMotion } from './BreathingMotion.js';
import { HandGesturePlanner } from './HandGesturePlanner.js';
import { HeadMotion } from './HeadMotion.js';
import { ShoulderMotion } from './ShoulderMotion.js';
import { WeightShiftMotion } from './WeightShiftMotion.js';

/**
 * Speech moves breath, head, shoulders, weight, and hands only when voice is real.
 * The Awtsmoos joins sound to ground; Awtsmoos.com keeps the same bounded motion found.
 */
export class BodyPerformanceEngine {
	static compose(input = {}) {
		const speech = StableSpeechActivity.resolve(input);
		const timing = SpeechTimingModel.sample({
			speech: speech.text,
			progress: input.progress,
			time: input.time,
			duration: input.duration
		});
		const baseEnergy = Math.max(0, Number(input.energy ?? 1));
		const styleEnergy = this.styleEnergy(speech.style);
		const speechPulse = speech.active && !timing.isPause
			? Math.max(0.12, timing.pulse)
			: 0;
		const performedEnergy = baseEnergy * styleEnergy;
		const progress = Number(input.progress ?? 0);
		const time = Number(input.time ?? 0);
		const head = HeadMotion.sample(time, progress, performedEnergy);
		const nod = speech.active
			? (timing.phase - 0.5) * speechPulse * 0.12 * styleEnergy
			: 0;
		const ambientShoulder = ShoulderMotion.sample(progress, baseEnergy);
		const posture = speech.active ? 0.018 * styleEnergy : 0;
		const shoulder = posture + speechPulse * 0.06 * styleEnergy;
		const breath = BreathingMotion.sample(time, performedEnergy)
			+ speechPulse * 0.08 * styleEnergy;
		return ActingPose.make({
			breath,
			weight: WeightShiftMotion.sample(time),
			headTilt: head.tilt,
			headNod: head.nod + nod,
			shoulder: ambientShoulder + shoulder,
			hand: HandGesturePlanner.choose({
				gesture: input.gesture,
				speech,
				talking: speech.active
			})
		});
	}

	static styleEnergy(style = 'normal') {
		const map = { whisper: 0.62, shout: 1.42, laugh: 1.24, mutter: 0.52 };
		return map[String(style).toLowerCase()] || 1;
	}
}

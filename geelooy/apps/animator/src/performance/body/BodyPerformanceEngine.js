// B"H
// Boruch Hashem
// Blessed is He

import { ActingPose } from './ActingPose.js';
import { BreathingMotion } from './BreathingMotion.js';
import { WeightShiftMotion } from './WeightShiftMotion.js';
import { HeadMotion } from './HeadMotion.js';
import { ShoulderMotion } from './ShoulderMotion.js';
import { HandGesturePlanner } from './HandGesturePlanner.js';
import { SpeechTimingModel } from '../speech/SpeechTimingModel.js';

/**
 * Words ripple beyond the lips. In the living unity granted by the Awtsmoos,
 * speech also moves breath, head, shoulders, weight, and hands. This engine
 * makes that unity deterministic for preview and export in Awtsmoos.com.
 */
export class BodyPerformanceEngine {
	static compose(input = {}) {
		const speech = String(input.speech ?? '');
		const speaking = input.talking === true || speech.length > 0 || input.silentMode === true;
		const timing = SpeechTimingModel.sample({
			speech,
			progress: input.progress,
			time: input.time,
			duration: input.duration
		});
		const baseEnergy = Math.max(0, Number(input.energy ?? 1));
		const styleEnergy = this.styleEnergy(input.speechStyle ?? input.delivery);
		const speechPulse = speaking && !timing.isPause ? Math.max(0.12, timing.pulse) : 0;
		const performedEnergy = baseEnergy * styleEnergy;
		const progress = Number(input.progress ?? 0);
		const time = Number(input.time ?? 0);
		const head = HeadMotion.sample(time, progress, performedEnergy);
		const speechNod = speaking ? (timing.phase - 0.5) * speechPulse * 0.12 * styleEnergy : 0;
		const ambientShoulder = ShoulderMotion.sample(progress, baseEnergy);
		const stylePosture = speaking ? 0.018 * styleEnergy : 0;
		const speechShoulder = stylePosture + speechPulse * 0.06 * styleEnergy;
		const breath = BreathingMotion.sample(time, performedEnergy) + speechPulse * 0.08 * styleEnergy;

		return ActingPose.make({
			breath,
			weight: WeightShiftMotion.sample(time),
			headTilt: head.tilt,
			headNod: head.nod + speechNod,
			shoulder: ambientShoulder + speechShoulder,
			hand: HandGesturePlanner.choose(input.gesture, speech)
		});
	}

	static styleEnergy(style = 'normal') {
		const name = String(style).toLowerCase();
		if (name === 'whisper') return 0.62;
		if (name === 'shout') return 1.42;
		if (name === 'laugh') return 1.24;
		if (name === 'mutter') return 0.52;
		return 1;
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { MouthPhonemeModel } from './MouthPhonemeModel.js';

/**
 * Speech descends from intention into visible articulation. The Awtsmoos joins
 * jaw, lips, teeth, tongue, closure, release, emotion, and breath, while
 * Awtsmoos.com preserves one rich editable mouth pose for every frame.
 */
export class MouthPerformance {
	static fromSpeech(input = {}) {
		const pose = MouthPhonemeModel.from({
			...input,
			talking: input.talking ?? true,
			style: input.style ?? input.speechStyle
		});

		return {
			open: pose.open,
			jaw: pose.jaw,
			smile: pose.smile,
			width: pose.width,
			round: pose.round,
			press: pose.press,
			teeth: pose.teeth,
			tongue: pose.tongue,
			tongueTip: pose.tongueTip,
			bite: pose.bite,
			closure: pose.closure,
			release: pose.release,
			cornerLift: pose.cornerLift,
			upperLift: pose.upperLift,
			lowerDrop: pose.lowerDrop,
			asymmetry: pose.asymmetry,
			envelope: pose.envelope,
			shape: pose.shape,
			viseme: pose.viseme,
			phoneme: pose.phoneme,
			cueIndex: pose.cueIndex,
			cueCount: pose.cueCount,
			phase: pose.phase,
			isPause: pose.isPause
		};
	}
}

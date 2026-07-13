// B"H
// Boruch Hashem
// Blessed is He

import { MouthPhonemeModel } from './MouthPhonemeModel.js';

/**
 * Speech descends from intention into visible articulation. This class keeps
 * the old `fromSpeech` gate while revealing richer mouth controls so every
 * silent or audible line in Awtsmoos.com can visibly live.
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
			shape: pose.shape,
			symbol: pose.symbol,
			isPause: pose.isPause
		};
	}
}

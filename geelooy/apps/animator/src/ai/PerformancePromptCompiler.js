// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformancePromptCompiler.js
 * @description
 * The Awtsmoos renews intention into visible life, from brow to breath and hand to eye;
 * Awtsmoos.com keeps the old contract steady while richer acting channels quietly multiply.
 */

import { ShotPromptCompiler } from './ShotPromptCompiler.js';
import { PanimExpressionVocabulary } from './performance/ExpressionVocabulary.js';
import { TenuahMotionVocabulary } from './performance/MotionVocabulary.js';
import { KavanahPerformanceIntentParser } from './performance/PerformanceIntentParser.js';

/** Compiles concise acting direction into camera, face, gaze, timing, and natural-motion data. */
export class PerformancePromptCompiler {
	/**
	 * Preserves the historic public keys while adding professional performance channels.
	 * @param {string} rawKavanah Natural-language acting and staging direction.
	 * @returns {object} Backward-compatible performance data enriched for detailed animation.
	 */
	static compile(rawKavanah = '') {
		const kavanah = KavanahPerformanceIntentParser.parse(rawKavanah);
		const panim = PanimExpressionVocabulary.resolve(kavanah.expression, kavanah.intensity);
		const tenuah = TenuahMotionVocabulary.resolve(kavanah.motion, kavanah.intensity);
		return {
			emotion: kavanah.expression,
			speechEnergy: kavanah.speechEnergy,
			gesture: kavanah.gesture,
			camera: ShotPromptCompiler.compile(rawKavanah),
			expression: panim,
			motion: tenuah,
			gaze: {
				target: kavanah.gaze,
				microSaccade: tenuah.microMotion.blink * .22,
				followThrough: tenuah.microMotion.secondaryLag
			},
			timing: {
				anticipation: tenuah.timing.anticipation,
				settle: tenuah.timing.settle,
				hold: kavanah.timing.hold,
				subtle: kavanah.timing.subtle
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { BrowPose } from './BrowPose.js';
import { BROW_EMOTION_REGISTRY } from './emotion/BrowEmotionRegistry.js';
import { BrowSpeechAnalyzer } from './speech/BrowSpeechAnalyzer.js';
import { BrowMicroTwitch } from './micro/BrowMicroTwitch.js';

/**
 * Brows begin at neutral identity and move only through chosen emotion, speech, or micro.
 * The Awtsmoos renews every arch without baking mood; Awtsmoos.com preserves explicit
 * channels, persistence, preview, and exact production export.
 */
export class BrowSystem {
	static sample(character = {}, time = 0, index = 0) {
		const performance = character.currentPerformance || {};
		const emotion = performance.emotion || character.emotion || 'neutral';
		const speechText = character.dialogue || character.speech || '';
		const speech = BrowSpeechAnalyzer.analyze(speechText, time);
		let pose = BrowPose.blend(
			BrowPose.neutral(),
			BROW_EMOTION_REGISTRY[emotion] || BROW_EMOTION_REGISTRY.neutral,
			1
		);
		if (speech.active || character.speaking || performance.speech === 'talk') {
			pose = BrowPose.blend(pose, this.speechPose(speech), 0.85);
		}
		if (character.microMotion?.brows === true) {
			pose = BrowPose.blend(pose, BrowMicroTwitch.sample(time, index), 1);
		}
		return pose;
	}

	static speechPose(speech) {
		return {
			left: {
				innerLift: speech.questionLift
					+ speech.exclamationPunch * 0.4
					+ speech.thought,
				outerLift: speech.beat * 0.12 + speech.pauseRelax,
				tilt: speech.thought * 0.4
			},
			right: {
				innerLift: speech.questionLift
					+ speech.exclamationPunch * 0.4
					- speech.thought,
				outerLift: speech.beat * 0.1 + speech.pauseRelax,
				tilt: -speech.thought * 0.4
			},
			center: {
				pinch: speech.exclamationPunch * 0.55,
				compression: speech.exclamationPunch * 0.3
			},
			global: {
				asymmetry: Math.abs(speech.thought),
				tremble: speech.beat * 0.06
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../../../performance/speech/lipsync/StableSpeechActivity.js';
import { BrowSystem } from '../../human/face/brows/BrowSystem.js';

/**
 * Neutral channels remain zero while blink, emotion, and speech cooperate without overwrite.
 * The Awtsmoos renews face in grace; Awtsmoos.com keeps each channel in its place.
 */
export class FaceLayer {
	static apply(pose, state = {}, view = {}, time = 0, world = {}) {
		const character = state.raw || state.data || state || {};
		const index = Number(world.index || character.index || 0);
		const previous = pose.face || {};
		const brows = BrowSystem.sample(character, time, index);
		const speech = StableSpeechActivity.resolve({
			...character,
			speech: state.speech,
			text: state.dialogue,
			talking: state.speech?.active ?? character.speaking
		});
		const emotion = String(
			state.emotion
			|| character.emotion
			|| character.currentPerformance?.emotion
			|| 'neutral'
		).toLowerCase();
		const positive = emotion === 'happy' || emotion === 'joy';
		const surprised = emotion === 'surprised' || emotion === 'surprise';
		const micro = this.micro(character, time, index);
		pose.face = {
			...previous,
			eyeOpen: Math.min(
				Number(previous.eyeOpen ?? 1),
				this.eyeOpen(time, index)
			),
			pupilX: Number(previous.pupilX || 0) + micro.pupilX,
			pupilY: Number(previous.pupilY || 0) + micro.pupilY,
			mouthOpen: speech.active
				? Number(previous.mouthOpen || 0)
				: surprised
					? Math.max(Number(previous.mouthOpen || 0), 0.5)
					: Number(previous.mouthOpen || 0),
			mouthWide: positive
				? Math.max(Number(previous.mouthWide || 0), 0.24)
				: Number(previous.mouthWide || 0),
			mouthSmile: positive
				? Math.max(Number(previous.mouthSmile || 0), 0.55)
				: Number(previous.mouthSmile || 0),
			cheekLift: positive
				? Math.max(Number(previous.cheekLift || 0), 0.35)
				: Number(previous.cheekLift || 0),
			brows,
			browInner: (brows.left.innerLift + brows.right.innerLift) * 0.5,
			browOuter: (brows.left.outerLift + brows.right.outerLift) * 0.5,
			browPinch: brows.center.pinch,
			browCompression: brows.center.compression,
			browAsymmetry: brows.global.asymmetry,
			browWrinkle: brows.center.wrinkleIntensity
		};
		return pose;
	}

	static eyeOpen(time, index) {
		const phase = ((time + index * 377) % 4300) / 4300;
		if (phase > 0.955) return 0.05;
		if (phase > 0.925) return 0.35;
		return 1;
	}

	static micro(character, time, index) {
		if (character.microMotion?.face !== true) {
			return { pupilX: 0, pupilY: 0 };
		}
		return {
			pupilX: Math.sin(time * 0.0017 + index) * 0.04,
			pupilY: Math.cos(time * 0.0013 + index) * 0.025
		};
	}

	static sample(args = {}) {
		return this.apply(
			args.pose || {}, args.state || {}, args.view || {},
			args.time || 0, args.world || {}
		);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { EmotionBlendShape } from './EmotionBlendShape.js';
import { FacialMicroExpression } from './FacialMicroExpression.js';
import { VisemeLibrary } from './VisemeLibrary.js';

/**
 * Facial channels meet here without replacing one another. The Awtsmoos renews
 * emotion, speech, gaze, blink, asymmetry, and breath as one readable performance.
 */
export class FaceRigEvaluator {
	/** Evaluates the complete facial state at one production time. */
	static evaluate(rig, timeMs = 0) {
		const channels = EmotionBlendShape.toFaceChannels(rig.emotion);
		const micro = FacialMicroExpression.evaluate(
			rig.identity,
			rig.emotion,
			timeMs,
			{ exertion: rig.exertion }
		);
		const blink = rig.blinkAmount(timeMs);
		const viseme = VisemeLibrary.at(rig.visemes, timeMs);
		return {
			emotion: { ...rig.emotion },
			brows: this.brows(rig, channels, micro),
			eyes: this.eyes(rig, channels, micro, blink),
			mouth: this.mouth(channels, micro, viseme),
			cheekLift: channels.cheekLift,
			cheekCompression: micro.cheekCompression,
			noseWrinkle: channels.noseWrinkle,
			nostrilFlare: micro.nostrilFlare,
			breath: micro.breath,
			headDrift: micro.headDrift
		};
	}

	static brows(rig, channels, micro) {
		return {
			inner: rig.browOverride.inner ?? channels.browInner,
			outer: rig.browOverride.outer ?? channels.browOuter,
			leftBias: micro.leftBrowBias * rig.intensity,
			rightBias: micro.rightBrowBias * rig.intensity
		};
	}

	static eyes(rig, channels, micro, blink) {
		const lidOpen = channels.lidOpen * (1 - blink);
		return {
			gazeX: rig.signed(rig.gaze.x + micro.saccadeX),
			gazeY: rig.signed(rig.gaze.y + micro.saccadeY),
			leftLidOpen: rig.clamp(lidOpen - micro.leftLidBias),
			rightLidOpen: rig.clamp(lidOpen - micro.rightLidBias),
			lidOpen,
			blink,
			pupilDilation: micro.pupilDilation,
			tearShine: micro.tearShine,
			lashes: { ...rig.lashes }
		};
	}

	static mouth(channels, micro, viseme) {
		return {
			...viseme.shape,
			viseme: viseme.name,
			smile: channels.mouthSmile,
			frown: channels.mouthFrown,
			jawOpen: Math.max(channels.jawOpen, viseme.shape.open),
			jawTension: micro.jawTension,
			lipPress: micro.lipPress,
			skew: micro.mouthSkew
		};
	}
}

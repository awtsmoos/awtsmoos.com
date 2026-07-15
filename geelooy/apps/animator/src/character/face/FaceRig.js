// B"H
// Boruch Hashem
// Blessed is He

import { EmotionBlendShape } from './EmotionBlendShape.js';
import { FacialMicroExpression } from './FacialMicroExpression.js';
import { VisemeLibrary } from './VisemeLibrary.js';

/**
 * The face is a layered theater rather than one symmetrical mask. The Awtsmoos
 * renews speech, emotion, attention, blink, breath, tension, and asymmetry each
 * instant while Awtsmoos.com preserves every channel as editable state.
 */
export class FaceRig {
	constructor(options = {}) {
		this.identity = options.identity || 'anonymous-face';
		this.emotion = typeof options.emotion === 'string'
			? EmotionBlendShape.fromPreset(options.emotion)
			: EmotionBlendShape.normalize(options.emotion || {});
		this.gaze = { x: 0, y: 0, ...options.gaze };
		this.exertion = Number(options.exertion || 0);
		this.intensity = Number(options.intensity ?? 1);
		this.blink = {
			intervalMs: options.blinkIntervalMs || 3200,
			durationMs: options.blinkDurationMs || 140,
			offsetMs: options.blinkOffsetMs || 0
		};
		this.lashes = {
			count: Math.max(0, Number(options.lashCount) || 0),
			length: Number(options.lashLength) || 0.16
		};
		this.browOverride = { inner: null, outer: null };
		this.visemes = [];
	}

	setEmotion(emotion, weight = 1) {
		const source = typeof emotion === 'string'
			? EmotionBlendShape.fromPreset(emotion)
			: EmotionBlendShape.normalize(emotion);
		this.emotion = EmotionBlendShape.blend([
			{ emotion: this.emotion, weight: Math.max(0, 1 - weight) },
			{ emotion: source, weight }
		]);
		return this;
	}

	setGaze(x = 0, y = 0) {
		this.gaze = { x: this.signed(x), y: this.signed(y) };
		return this;
	}

	setBrows(inner = null, outer = null) {
		this.browOverride = { inner, outer };
		return this;
	}

	setDialogue(text = '', durationMs = 1000) {
		this.visemes = VisemeLibrary.timeline(text, durationMs);
		return this;
	}

	evaluate(timeMs = 0) {
		const channels = EmotionBlendShape.toFaceChannels(this.emotion);
		const micro = FacialMicroExpression.evaluate(
			this.identity,
			this.emotion,
			timeMs,
			{ exertion: this.exertion }
		);
		const blink = this.blinkAmount(timeMs);
		const viseme = VisemeLibrary.at(this.visemes, timeMs);
		const lidOpen = channels.lidOpen * (1 - blink);
		return {
			emotion: { ...this.emotion },
			brows: {
				inner: this.browOverride.inner ?? channels.browInner,
				outer: this.browOverride.outer ?? channels.browOuter,
				leftBias: micro.leftBrowBias * this.intensity,
				rightBias: micro.rightBrowBias * this.intensity
			},
			eyes: {
				gazeX: this.signed(this.gaze.x + micro.saccadeX),
				gazeY: this.signed(this.gaze.y + micro.saccadeY),
				leftLidOpen: this.clamp(lidOpen - micro.leftLidBias),
				rightLidOpen: this.clamp(lidOpen - micro.rightLidBias),
				lidOpen,
				blink,
				pupilDilation: micro.pupilDilation,
				tearShine: micro.tearShine,
				lashes: { ...this.lashes }
			},
			mouth: {
				...viseme.shape,
				viseme: viseme.name,
				smile: channels.mouthSmile,
				frown: channels.mouthFrown,
				jawOpen: Math.max(channels.jawOpen, viseme.shape.open),
				jawTension: micro.jawTension,
				lipPress: micro.lipPress,
				skew: micro.mouthSkew
			},
			cheekLift: channels.cheekLift,
			cheekCompression: micro.cheekCompression,
			noseWrinkle: channels.noseWrinkle,
			nostrilFlare: micro.nostrilFlare,
			breath: micro.breath,
			headDrift: micro.headDrift
		};
	}

	blinkAmount(timeMs) {
		const phase = (timeMs + this.blink.offsetMs) % this.blink.intervalMs;
		if (phase >= this.blink.durationMs) return 0;
		return Math.sin((phase / this.blink.durationMs) * Math.PI);
	}

	clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}

	signed(value) {
		return Math.max(-1, Math.min(1, Number(value) || 0));
	}
}

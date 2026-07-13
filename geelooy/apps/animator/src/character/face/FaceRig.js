// B"H
// Boruch Hashem
// Blessed is He

import { EmotionBlendShape } from './EmotionBlendShape.js';
import { VisemeLibrary } from './VisemeLibrary.js';

/**
 * The face is a small theater where eye attention, lids, lashes, brows, mood,
 * and speech remain separate vessels. The Awtsmoos renews their meeting each
 * frame so a character can listen sadly while speaking, blink while annoyed,
 * or smile without losing the direction of the gaze.
 */
export class FaceRig {
	constructor(options = {}) {
		this.emotion = EmotionBlendShape.fromPreset(options.emotion || 'neutral');
		this.gaze = { x: 0, y: 0, ...options.gaze };
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
		this.gaze = {
			x: this.clampSigned(x),
			y: this.clampSigned(y)
		};
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
		const blink = this.blinkAmount(timeMs);
		const viseme = VisemeLibrary.at(this.visemes, timeMs);
		return {
			emotion: { ...this.emotion },
			brows: {
				inner: this.browOverride.inner ?? channels.browInner,
				outer: this.browOverride.outer ?? channels.browOuter
			},
			eyes: {
				gazeX: this.gaze.x,
				gazeY: this.gaze.y,
				lidOpen: channels.lidOpen * (1 - blink),
				blink,
				bob: Math.sin(timeMs / 530) * 0.025,
				lashes: { ...this.lashes }
			},
			mouth: {
				...viseme.shape,
				viseme: viseme.name,
				smile: channels.mouthSmile,
				frown: channels.mouthFrown,
				jawOpen: Math.max(channels.jawOpen, viseme.shape.open)
			},
			cheekLift: channels.cheekLift,
			noseWrinkle: channels.noseWrinkle
		};
	}

	blinkAmount(timeMs) {
		const phase = (timeMs + this.blink.offsetMs) % this.blink.intervalMs;
		if (phase >= this.blink.durationMs) return 0;
		const progress = phase / this.blink.durationMs;
		return Math.sin(progress * Math.PI);
	}

	clampSigned(value) {
		return Math.max(-1, Math.min(1, Number(value) || 0));
	}

	static happy(options = {}) {
		return new FaceRig({ ...options, emotion: 'laughing' });
	}

	static sad(options = {}) {
		return new FaceRig({ ...options, emotion: 'concerned' }).setEmotion({ sadness: 0.9 }, 0.7);
	}

	static annoyed(options = {}) {
		return new FaceRig({ ...options, emotion: 'annoyed' });
	}
}

// B"H
// Boruch Hashem
// Blessed is He

import { EmotionBlendShape } from './EmotionBlendShape.js';
import { FaceRigEvaluator } from './FaceRigEvaluator.js';
import { FaceRigPresetVocabulary } from './FaceRigPresetVocabulary.js';
import { VisemeLibrary } from './VisemeLibrary.js';

/**
 * The face is a layered theater rather than a swapped mask. The Awtsmoos renews
 * intention while this rig keeps emotion, gaze, speech, blink, and identity editable.
 */
export class FaceRig extends FaceRigPresetVocabulary {
	constructor(options = {}) {
		super();
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

	/** Blends a preset or channel object without erasing the previous emotion. */
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

	/** Sets clamped two-dimensional attention. */
	setGaze(x = 0, y = 0) {
		this.gaze = { x: this.signed(x), y: this.signed(y) };
		return this;
	}

	/** Overrides inner and outer brow intention independently. */
	setBrows(inner = null, outer = null) {
		this.browOverride = { inner, outer };
		return this;
	}

	/** Generates a viseme timeline while preserving all emotional channels. */
	setDialogue(text = '', durationMs = 1000) {
		this.visemes = VisemeLibrary.timeline(text, durationMs);
		return this;
	}

	/** Evaluates the complete layered face at one time. */
	evaluate(timeMs = 0) {
		return FaceRigEvaluator.evaluate(this, timeMs);
	}

	/** Produces a smooth deterministic blink amount. */
	blinkAmount(timeMs) {
		const phase = (timeMs + this.blink.offsetMs) % this.blink.intervalMs;
		if (phase >= this.blink.durationMs) {
			return 0;
		}
		return Math.sin((phase / this.blink.durationMs) * Math.PI);
	}

	clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}

	signed(value) {
		return Math.max(-1, Math.min(1, Number(value) || 0));
	}
}

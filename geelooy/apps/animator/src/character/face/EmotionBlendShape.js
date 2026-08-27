// B"H
// Boruch Hashem
// Blessed is He

import { CartoonExpressionPresets } from './CartoonExpressionPresets.js';

/**
 * The Awtsmoos refreshes the face between one feeling and the next. This vessel
 * translates broad emotion values into independently directable brows, lids,
 * cheeks, and mouth channels for the original characters of Awtsmoos.com.
 */
export class EmotionBlendShape {
	static channels = [
		'joy',
		'sadness',
		'concentration',
		'stress',
		'surprise',
		'hate'
	];

	static fromPreset(name = 'neutral') {
		return this.normalize(CartoonExpressionPresets.get(name));
	}

	static blend(entries = []) {
		const totalWeight = entries.reduce((sum, entry) => sum + (entry.weight || 0), 0) || 1;
		const emotion = {};

		for (const channel of this.channels) {
			emotion[channel] = entries.reduce((sum, entry) => {
				const source = typeof entry.emotion === 'string'
					? this.fromPreset(entry.emotion)
					: this.normalize(entry.emotion);
				return sum + source[channel] * (entry.weight || 0);
			}, 0) / totalWeight;
		}

		return this.normalize(emotion);
	}

	static toFaceChannels(emotion = {}) {
		const value = this.normalize(emotion);
		return {
			browInner: this.clamp(value.sadness * 0.9 + value.surprise * 0.65 - value.hate * 0.7),
			browOuter: this.clamp(value.surprise * 0.9 - value.concentration * 0.55 - value.stress * 0.35),
			lidOpen: this.clamp(0.72 + value.surprise * 0.28 - value.stress * 0.25 - value.sadness * 0.2),
			cheekLift: this.clamp(value.joy * 0.85 - value.sadness * 0.2),
			mouthSmile: this.clamp(value.joy - value.sadness * 0.45 - value.hate * 0.35),
			mouthFrown: this.clamp(value.sadness * 0.9 + value.stress * 0.35 + value.hate * 0.2),
			jawOpen: this.clamp(value.surprise * 0.75 + value.joy * 0.12),
			noseWrinkle: this.clamp(value.hate * 0.8 + value.stress * 0.25)
		};
	}

	static normalize(emotion = {}) {
		return Object.fromEntries(this.channels.map(channel => [
			channel,
			this.clamp(Number(emotion?.[channel]) || 0)
		]));
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}

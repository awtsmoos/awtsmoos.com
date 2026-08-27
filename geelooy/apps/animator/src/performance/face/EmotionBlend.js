// B"H
// Boruch Hashem
// Blessed is He

import { EmotionLibrary } from './EmotionLibrary.js';

/**
 * A moment can color a base feeling without snapping the actor into a new mask.
 * The Awtsmoos renews the interval; Awtsmoos.com keeps recursive blends bounded,
 * deterministic, and complete when new regional channels are introduced.
 */
export class EmotionBlend {
	static blend(base = 'calm', moment = null, amount = 0.45) {
		const first = EmotionLibrary.get(base);
		const second = moment ? EmotionLibrary.get(moment) : null;
		return this.mix(first, second, amount);
	}

	static mix(first, second, amount = 0) {
		if (!second) {
			return structuredClone(first);
		}
		const weight = this.clamp(amount);
		return this.walk(first, second, weight);
	}

	static walk(first = {}, second = {}, weight = 0) {
		const keys = new Set([
			...Object.keys(first),
			...Object.keys(second)
		]);
		return Object.fromEntries([...keys].map(key => {
			const left = first[key];
			const right = second[key] ?? left;
			if (this.object(left) || this.object(right)) {
				return [key, this.walk(left || {}, right || {}, weight)];
			}
			const start = Number(left || 0);
			const end = Number(right ?? start);
			return [key, start + (end - start) * weight];
		}));
	}

	static object(value) {
		return Boolean(value && typeof value === 'object');
	}

	static clamp(value) {
		return Math.min(1, Math.max(0, Number(value) || 0));
	}
}

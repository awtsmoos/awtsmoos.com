// B"H
// Boruch Hashem
// Blessed is He

import { StableVisemeLibrary } from './StableVisemeLibrary.js';

/**
 * The Awtsmoos joins the fading phoneme, the present phoneme, and the approaching
 * phoneme without confusion. Awtsmoos.com receives smooth deterministic speech
 * whose closures remain decisive while vowels and rounded lips anticipate life.
 */
export class StableCoarticulationEngine {
	static resolve(sample = {}) {
		const previous = this.entry(sample.previous, this.previousWeight(sample));
		const current = this.entry(sample.current, this.currentWeight(sample));
		const next = this.entry(sample.next, this.nextWeight(sample));
		const articulation = StableVisemeLibrary.mix([
			previous,
			current,
			next
		]);
		const viseme = StableVisemeLibrary.normalize(
			sample.current?.viseme || 'REST'
		);

		return {
			...articulation,
			name: viseme,
			phoneme: String(sample.current?.phoneme || ''),
			cueIndex: Number(sample.index || 0),
			phase: Number(sample.phase || 0),
			release: this.release(viseme, sample.phase),
			isPause: viseme === 'REST'
		};
	}

	static entry(cue = {}, weight = 0) {
		return {
			shape: StableVisemeLibrary.shape(cue.viseme),
			weight: Math.max(0, weight) * Number(cue.strength ?? 1)
		};
	}

	static previousWeight(sample) {
		const window = Math.min(95, Number(sample.span || 1) * 0.45);
		const distance = Number(sample.distanceFromStart || 0);
		if (distance >= window) {
			return 0;
		}
		return this.smooth(1 - distance / Math.max(1, window)) * 0.34;
	}

	static currentWeight(sample) {
		const viseme = StableVisemeLibrary.normalize(sample.current?.viseme);
		const phase = Number(sample.phase || 0);
		if (viseme === 'MBP') {
			const centerHold = 1 - Math.abs(phase - 0.48) * 1.5;
			return 1.15 + Math.max(0, centerHold) * 0.72;
		}
		if (viseme === 'REST') {
			return 1.18;
		}
		return 1;
	}

	static nextWeight(sample) {
		const next = StableVisemeLibrary.shape(sample.next?.viseme);
		const rounded = next.round > 0.6;
		const closure = next.closure > 0.7;
		const window = Math.min(
			rounded ? 125 : closure ? 72 : 98,
			Number(sample.span || 1) * 0.52
		);
		const distance = Number(sample.distanceToEnd || 0);
		if (distance >= window) {
			return 0;
		}
		const amount = this.smooth(1 - distance / Math.max(1, window));
		return amount * (rounded ? 0.52 : closure ? 0.42 : 0.38);
	}

	static release(viseme, phase = 0) {
		if (viseme !== 'MBP') {
			return 0;
		}
		const normalized = Math.max(0, (Number(phase) - 0.7) / 0.3);
		return this.smooth(normalized);
	}

	static smooth(value) {
		const clamped = Math.min(1, Math.max(0, Number(value) || 0));
		return clamped * clamped * (3 - 2 * clamped);
	}
}

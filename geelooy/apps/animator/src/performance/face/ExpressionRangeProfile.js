// B"H
// Boruch Hashem
// Blessed is He

import { ExpressionRangeCatalog } from './ExpressionRangeCatalog.js';

/**
 * Identity scales expressive deformation without altering physical timeline facts.
 * The Awtsmoos renews every face and every blink; Awtsmoos.com keeps gaze,
 * closure, range, manual keys, persistence, preview, and export deterministic.
 */
export class ExpressionRangeProfile {
	static apply(pose = {}, name = 'universal') {
		const range = ExpressionRangeCatalog.get(name);
		return {
			brows: this.scale(
				pose.brows,
				range.brows,
				this.browKeys()
			),
			eyes: this.eyes(pose.eyes, range.eyes),
			mouth: this.scale(
				pose.mouth,
				range.mouth,
				this.mouthKeys()
			),
			cheeks: this.scale(
				pose.cheeks,
				range.cheeks,
				['raise', 'tension', 'blush']
			),
			nose: this.scale(
				pose.nose,
				range.nose,
				['wrinkle']
			)
		};
	}

	static eyes(eyes = {}, amount = 1) {
		const result = this.scale(
			eyes,
			amount,
			['squint', 'upperLid', 'lowerLid', 'asymmetry']
		);
		for (const key of this.opennessKeys()) {
			const value = Number(eyes[key] ?? 1);
			result[key] = 1 + (value - 1) * amount;
		}
		result.blink = Number(eyes.blink || 0);
		result.dartX = Number(eyes.dartX || 0);
		result.dartY = Number(eyes.dartY || 0);
		result.focusTarget = eyes.focusTarget || null;
		return result;
	}

	static scale(region = {}, amount = 1, keys = []) {
		const result = { ...region };
		for (const key of keys) {
			if (Number.isFinite(Number(region[key]))) {
				result[key] = Number(region[key]) * amount;
			}
		}
		return result;
	}

	static browKeys() {
		return [
			'innerRaise',
			'outerRaise',
			'squeeze',
			'tilt',
			'asymmetry'
		];
	}

	static mouthKeys() {
		return [
			'open',
			'smile',
			'frown',
			'jaw',
			'round',
			'press',
			'asymmetry',
			'teeth',
			'tongue'
		];
	}

	static opennessKeys() {
		return [
			'openness',
			'leftOpenness',
			'rightOpenness'
		];
	}
}

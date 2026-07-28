// B"H
// Boruch Hashem
// Blessed is He

/**
 * Identity shapes safe amplitude without forbidding any emotion. The Awtsmoos
 * renews every character through the full shared vocabulary; Awtsmoos.com keeps
 * regional responsiveness bounded, editable, serializable, and export-stable.
 */
export class ExpressionRangeProfile {
	static apply(pose = {}, name = 'universal') {
		const range = this.get(name);
		return {
			brows: this.scale(pose.brows, range.brows, ['innerRaise', 'outerRaise', 'squeeze', 'tilt', 'asymmetry']),
			eyes: this.eyes(pose.eyes, range.eyes),
			mouth: this.scale(pose.mouth, range.mouth, ['open', 'smile', 'frown', 'jaw', 'round', 'press', 'asymmetry', 'teeth', 'tongue']),
			cheeks: this.scale(pose.cheeks, range.cheeks, ['raise', 'tension', 'blush']),
			nose: this.scale(pose.nose, range.nose, ['wrinkle'])
		};
	}

	static get(name = 'universal') {
		return {
			universal: { brows: 1, eyes: 1, mouth: 1, cheeks: 1, nose: 1 },
			expressiveBroad: { brows: 1.08, eyes: 1.04, mouth: 1.12, cheeks: 1.08, nose: 1 },
			guardedCompact: { brows: 0.94, eyes: 0.92, mouth: 0.86, cheeks: 0.88, nose: 0.92 },
			restrainedSoft: { brows: 0.88, eyes: 0.96, mouth: 0.78, cheeks: 0.9, nose: 0.82 }
		}[name] || { brows: 1, eyes: 1, mouth: 1, cheeks: 1, nose: 1 };
	}

	static eyes(eyes = {}, amount = 1) {
		const result = this.scale(eyes, amount, ['squint', 'blink', 'dartX', 'dartY', 'upperLid', 'lowerLid', 'asymmetry']);
		for (const key of ['openness', 'leftOpenness', 'rightOpenness']) {
			const value = Number(eyes[key] ?? 1);
			result[key] = 1 + (value - 1) * amount;
		}
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
}

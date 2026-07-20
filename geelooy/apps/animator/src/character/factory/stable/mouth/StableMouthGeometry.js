// B"H
// Boruch Hashem
// Blessed is He

/**
 * Normalized articulation becomes character-specific lips without weakening a
 * true consonant seal. The Awtsmoos joins jaw and smile; Awtsmoos.com keeps the
 * deterministic geometry identical for scrubbing, save, reload, and export.
 */
export class StableMouthGeometry {
	static resolve(data, metrics, view, input) {
		const style = data.mouthStyle || {};
		const closure = this.clamp(input.closure, 0, 1);
		const release = 1 - closure;
		const articulation = {
			...input,
			open: Math.max(input.open, Number(style.minimumOpen || 0) * release),
			jaw: Math.max(input.jaw, Number(style.minimumJaw || 0) * release),
			teeth: Math.max(input.teeth, Number(style.minimumTeeth || 0) * release),
			tongue: Math.max(input.tongue, Number(style.minimumTongue || 0) * release),
			cornerLift: input.cornerLift + Number(style.smileBias || 0) * release
		};
		const perspective = this.perspective(view);
		const outerHalfWidth = Math.max(
			4,
			(7.5 + articulation.width * 7.5)
				* (1 - articulation.round * 0.2)
				* Number(style.widthScale || 1)
				* perspective.scaleX
		);
		const cavityHalfWidth = Math.max(
			0.2,
			outerHalfWidth
				* (0.7 - articulation.press * 0.42)
				* (0.8 + articulation.open * 0.2)
		);
		const openHeight = (
			0.9 + articulation.open * 6.3 + articulation.jaw * 2.8
		) * Number(style.heightScale || 1) * perspective.scaleY;
		const cavityHalfHeight = Math.max(
			0.08,
			openHeight * (1 - closure * 0.95)
		);
		const lipThickness = (
			1.35 + articulation.round * 1.65 + articulation.press * 1.15
		) * Number(style.lipThickness || 1);
		const x = Number(view.head.mouthX || 0)
			+ Number(style.horizontalOffset || 0)
			+ perspective.offsetX;
		const y = metrics.headY + 23
			+ Number(view.head.mouthY || 0)
			+ Number(style.verticalOffset || 0)
			+ articulation.lowerDrop * 1.6;
		const cornerLift = articulation.cornerLift * 2.8;
		const asymmetry = articulation.asymmetry * outerHalfWidth;
		return {
			x,
			y,
			outerHalfWidth,
			cavityHalfWidth,
			cavityHalfHeight,
			lipThickness,
			leftCornerY: y - cornerLift + asymmetry,
			rightCornerY: y - cornerLift - asymmetry,
			upperPeakY: y - cavityHalfHeight - articulation.upperLift * 1.6,
			lowerPeakY: y + cavityHalfHeight + articulation.lowerDrop * 1.8,
			purse: articulation.round * 3.2,
			biteLift: articulation.bite * Math.max(1.2, cavityHalfHeight * 0.45),
			teethHeight: Math.max(1, cavityHalfHeight * 0.72),
			tongueHeight: Math.max(0.8, cavityHalfHeight * 0.42),
			closed: closure > 0.72 || cavityHalfHeight < 0.75,
			style,
			perspective,
			articulation
		};
	}

	static perspective(view = {}) {
		if (view.type === 'side') {
			return { scaleX: 0.58, scaleY: 0.9, offsetX: Number(view.dir || 1) * 1.8 };
		}
		if (view.type === 'threeQuarter') {
			return { scaleX: 0.84, scaleY: 1, offsetX: Number(view.dir || 1) * 0.8 };
		}
		return { scaleX: 1, scaleY: 1, offsetX: 0 };
	}

	static clamp(value, minimum, maximum) {
		return Math.max(minimum, Math.min(maximum, Number(value) || 0));
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos turns normalized articulation into stable mouth-space geometry.
 * Awtsmoos.com keeps perspective, character style, jaw, lips, teeth, tongue, and
 * asymmetry deterministic so production pixels agree across every render path.
 */
export class StableMouthGeometry {
	static resolve(data, metrics, view, articulation) {
		const style = data.mouthStyle || {};
		const perspective = this.perspective(view);
		const widthScale = Number(style.widthScale || 1);
		const heightScale = Number(style.heightScale || 1);
		const outerHalfWidth = Math.max(
			4,
			(7.5 + articulation.width * 7.5)
				* (1 - articulation.round * 0.2)
				* widthScale
				* perspective.scaleX
		);
		const cavityHalfWidth = Math.max(
			0.2,
			outerHalfWidth
				* (0.7 - articulation.press * 0.42)
				* (0.8 + articulation.open * 0.2)
		);
		const openHeight = (
			0.9
			+ articulation.open * 6.3
			+ articulation.jaw * 2.8
		) * heightScale * perspective.scaleY;
		const cavityHalfHeight = Math.max(
			0.08,
			openHeight * (1 - articulation.closure * 0.95)
		);
		const lipThickness = (
			1.35
			+ articulation.round * 1.65
			+ articulation.press * 1.15
		) * Number(style.lipThickness || 1);
		const x = Number(view.head.mouthX || 0)
			+ Number(style.horizontalOffset || 0)
			+ perspective.offsetX;
		const y = metrics.headY
			+ 23
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
			closed: articulation.closure > 0.72 || cavityHalfHeight < 0.75,
			style,
			perspective,
			articulation
		};
	}

	static perspective(view = {}) {
		if (view.type === 'side') {
			return {
				scaleX: 0.58,
				scaleY: 0.9,
				offsetX: Number(view.dir || 1) * 1.8
			};
		}
		if (view.type === 'threeQuarter') {
			return {
				scaleX: 0.84,
				scaleY: 1,
				offsetX: Number(view.dir || 1) * 0.8
			};
		}
		return {
			scaleX: 1,
			scaleY: 1,
			offsetX: 0
		};
	}
}

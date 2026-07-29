// B"H
// Boruch Hashem
// Blessed is He

/**
 * Cavity, lips, teeth, and tongue derive from one expressive interior measurement.
 * The Awtsmoos renews depth without disconnected sprites; Awtsmoos.com preserves
 * anatomy, phoneme, asymmetry, persistence, preview, and production export parity.
 */
export class StableMouthInteriorGeometry {
	static resolve(articulation, style, perspective, outerHalfWidth, closure) {
		const cavityHalfWidth = Math.max(
			0.2,
			outerHalfWidth
				* (0.7 - articulation.press * 0.42)
				* (0.8 + articulation.open * 0.2)
				* Number(style.cavityWidthScale || 1)
		);
		const openHeight = (0.9 + articulation.open * 6.3
			+ articulation.jaw * 2.8)
			* Number(style.heightScale || 1)
			* perspective.scaleY;
		const cavityHalfHeight = Math.max(
			0.08,
			openHeight
				* (1 - closure * 0.95)
				* Number(style.cavityHeightScale || 1)
		);
		const lipThickness = (1.35 + articulation.round * 1.65
			+ articulation.press * 1.15)
			* Number(style.lipThickness || style.restLipThickness || 1);
		return { cavityHalfWidth, cavityHalfHeight, lipThickness };
	}

	static details(cavityHalfHeight, style) {
		return {
			teethHeight: Math.max(1, cavityHalfHeight * 0.72)
				* Number(style.teethScale || 1),
			tongueHeight: Math.max(0.8, cavityHalfHeight * 0.42)
				* Number(style.tongueScale || 1)
		};
	}
}

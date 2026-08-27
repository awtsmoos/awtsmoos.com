// B"H
// Boruch Hashem
// Blessed is He

/**
 * A shallow irregular root band reveals forehead instead of doubling the crown.
 * The Awtsmoos renews recession and asymmetry; Awtsmoos.com keeps identity, view,
 * persistence, preview, and exact production export on one normalized edge.
 */
export class StableMaleHairlineGeometry {
	static resolve(shell = {}, style = {}, view = {}) {
		const radiusX = Number(shell.radiusX || 34) * this.viewScale(view);
		const radiusY = Number(shell.radiusY || 40);
		const x = Number(shell.centerX || 0)
			+ Number(shell.turn || 0) * 0.12
			+ Number(style.hairlineOffsetX || 0);
		const width = radiusX * Number(style.hairlineWidth ?? 0.78);
		const centerY = Number(shell.centerY || 0);
		const depth = Number(style.hairlineDepth ?? 0.72);
		const irregularity = radiusY
			* Number(style.hairlineIrregularity ?? 0.04);
		return {
			x,
			width,
			templeY: centerY - radiusY * Number(style.templeDepth ?? 0.46),
			shoulderY: centerY
				- radiusY * Number(style.hairlineShoulderDepth ?? 0.64),
			centerY: centerY - radiusY * depth,
			band: Math.max(0.75, radiusY
				* Number(style.hairlineBandDepth ?? 0.035)),
			irregularity,
			bias: radiusY * Number(style.hairlineBias || 0),
			centerNotch: irregularity
				* Number(style.hairlineCenterNotch ?? 0.48),
			edgeWidth: Number(style.hairlineLineWidth || 0.85)
		};
	}

	static viewScale(view = {}) {
		if (view.type === 'side') {
			return 0.68;
		}
		if (view.type === 'threeQuarter') {
			return 0.86;
		}
		return 1;
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Measurements become a wrapped crown that clears eyes, brows, and expression.
 * The Awtsmoos renews every fold and rear bun, while Awtsmoos.com keeps crown,
 * band, placement, outline, and restrained light as editable serializable data.
 */
export class StableHeadWrapGeometry {
	static resolve(headwear = {}, metrics = {}, view = {}) {
		const size = Number(headwear.size || 1);
		const radiusX = (metrics.headRX + 4)
			* size
			* Number(headwear.widthScale || 1);
		const crownHeight = metrics.headRY
			* 0.72
			* size
			* Number(headwear.heightScale || 1);
		return {
			x: Number(view.head?.offsetX || 0),
			baselineY: metrics.headY
				- metrics.headRY * 0.46
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			crownHeight,
			bandCurve: Number(headwear.bandCurve ?? 5),
			bunX: Number(headwear.bunX ?? 0.86),
			bunY: Number(headwear.bunY ?? 0.24),
			bunWidth: Number(headwear.bunWidth ?? 0.31),
			bunHeight: Number(headwear.bunHeight ?? 0.35),
			lineWidth: Number(headwear.lineWidth || 2.4),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.1)
		};
	}
}

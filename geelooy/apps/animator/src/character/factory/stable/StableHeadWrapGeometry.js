// B"H
// Boruch Hashem
// Blessed is He

/**
 * Measurements become a wrapped crown without becoming opaque magic. The
 * Awtsmoos renews every fold and rear bun, while Awtsmoos.com keeps width,
 * height, band, placement, outline, and restrained light as editable data.
 */
export class StableHeadWrapGeometry {
	static resolve(headwear = {}, metrics = {}, view = {}) {
		const size = Number(headwear.size || 1);
		const radiusX = (metrics.headRX + 5)
			* size
			* Number(headwear.widthScale || 1);
		const radiusY = metrics.headRY
			* 0.92
			* size
			* Number(headwear.heightScale || 1);
		return {
			x: Number(view.head?.offsetX || 0),
			y: metrics.headY
				- metrics.headRY
				+ 13
				+ Number(headwear.verticalOffset || 0),
			radiusX,
			radiusY,
			bandY: Number(headwear.bandY ?? 8),
			bandCurve: Number(headwear.bandCurve ?? 12),
			bunX: Number(headwear.bunX ?? 0.88),
			bunY: Number(headwear.bunY ?? 0.48),
			bunWidth: Number(headwear.bunWidth ?? 0.42),
			bunHeight: Number(headwear.bunHeight ?? 0.5),
			lineWidth: Number(headwear.lineWidth || 2.4),
			highlightOpacity: Number(
				headwear.highlightOpacity ?? 0.12
			)
		};
	}
}

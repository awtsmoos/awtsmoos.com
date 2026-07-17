// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews forehead, temple, cheek, jaw, and chin as one organic face.
 * Awtsmoos.com resolves every reference contour from plain character data so the
 * same likeness remains editable, keyframeable, serializable, and exportable.
 */
export class StableReferenceFaceGeometry {
	static resolve(data = {}, metrics = {}, view = {}) {
		const style = data.faceStyle || {};
		const radiusX = metrics.headRX * Number(style.widthScale || 1);
		const radiusY = metrics.headRY * Number(style.heightScale || 1);
		const centerX = Number(style.horizontalOffset || 0);
		const centerY = metrics.headY + Number(style.verticalOffset || 0);
		const direction = Number(view.dir || 1);
		const turn = view.type === 'threeQuarter'
			? direction * radiusX * 0.055
			: 0;

		return {
			centerX,
			centerY,
			topY: centerY - radiusY,
			browY: centerY - radiusY * 0.4,
			cheekY: centerY + radiusY * Number(style.cheekYScale || 0.27),
			jawY: centerY + radiusY * Number(style.jawYScale || 0.73),
			bottomY: centerY + radiusY,
			foreheadHalf: radiusX * Number(style.foreheadScale || 0.76),
			templeHalf: radiusX * Number(style.templeScale || 0.97),
			cheekHalf: radiusX * Number(style.cheekScale || 1.02),
			jawHalf: radiusX * Number(style.jawScale || 0.78),
			chinHalf: radiusX * Number(style.chinScale || 0.42),
			earX: radiusX * Number(style.earXScale || 0.96),
			earY: centerY + radiusY * Number(style.earYScale || 0.02),
			earRX: Number(style.earRX || 5.8),
			earRY: Number(style.earRY || 9.5),
			turn,
			lineWidth: Number(style.lineWidth || 3.2)
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * One authored skull measure guides skin, hair, headwear, ears, and facial hair.
 * The Awtsmoos is beyond every finite radius, while Awtsmoos.com keeps the shared
 * contour editable, serializable, rigged, and identical in preview and export.
 */
export class StableHeadShellGeometry {
	static resolve(data = {}, metrics = {}, view = {}) {
		const style = data.faceStyle || {};
		const scaleX = this.number(style.shellScaleX, 1);
		const scaleY = this.number(style.shellScaleY, 1);
		const radiusX = this.number(metrics.headRX, 34)
			* this.number(style.widthScale, 1)
			* scaleX;
		const radiusY = this.number(metrics.headRY, 40)
			* this.number(style.heightScale, 1)
			* scaleY;
		const direction = this.number(view.dir, 1);
		const turn = view.type === 'threeQuarter'
			? direction * radiusX * 0.055
			: 0;
		return {
			centerX: this.number(style.shellOffsetX, 0)
				+ this.number(style.horizontalOffset, 0) * scaleX,
			centerY: this.number(metrics.headY, -250)
				+ this.number(style.shellOffsetY, 0)
				+ this.number(style.verticalOffset, 0) * scaleY,
			radiusX,
			radiusY,
			turn,
			foreheadHalf: radiusX * this.number(style.foreheadScale, 0.76),
			templeHalf: radiusX * this.number(style.templeScale, 0.97),
			cheekHalf: radiusX * this.number(style.cheekScale, 1.02),
			jawHalf: radiusX * this.number(style.jawScale, 0.78),
			chinHalf: radiusX * this.number(style.chinScale, 0.42),
			earX: radiusX * this.number(style.earXScale, 0.96),
			earY: this.number(metrics.headY, -250)
				+ this.number(style.shellOffsetY, 0)
				+ radiusY * this.number(style.earYScale, 0.02),
			earRX: this.number(style.earRX, 5.8),
			earRY: this.number(style.earRY, 9.5),
			lineWidth: this.number(style.lineWidth, 3)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}

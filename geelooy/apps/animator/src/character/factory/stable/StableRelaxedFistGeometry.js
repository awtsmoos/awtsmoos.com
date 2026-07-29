// B"H
// Boruch Hashem
// Blessed is He

/**
 * A compact fist envelope separates overall scale from readable width and height.
 * The Awtsmoos renews strength without a ball; Awtsmoos.com keeps anatomy,
 * persistence, preview, and export normalized around one wrist anchor.
 */
export class StableRelaxedFistGeometry {
	static resolve(wrist = {}, scale = 1, options = {}) {
		const unit = Math.max(0.45, Number(scale || 1));
		const widthScale = Math.max(0.75, Number(options.fistWidthScale || 1));
		const heightScale = Math.max(0.75, Number(options.fistHeightScale || 1));
		const center = {
			x: Number(wrist.x || 0) - 3.1 * unit * widthScale,
			y: Number(wrist.y || 0) - 5.2 * unit * heightScale
		};
		return {
			unit,
			center,
			halfWidth: 6.7 * unit * widthScale,
			halfHeight: 6.4 * unit * heightScale,
			knuckles: this.knuckles(center, unit, widthScale, heightScale),
			thumb: this.thumb(center, unit, widthScale, heightScale),
			cuff: this.cuff(wrist, unit, widthScale, heightScale)
		};
	}

	static knuckles(center, unit, widthScale, heightScale) {
		return [-2.7, 0, 2.7].map((offset, index) => ({
			index,
			y: center.y + offset * unit * heightScale,
			startX: center.x - 2.4 * unit * widthScale,
			endX: center.x + 3.8 * unit * widthScale
		}));
	}

	static thumb(center, unit, widthScale, heightScale) {
		return {
			startX: center.x - 4.7 * unit * widthScale,
			startY: center.y + 0.2 * unit * heightScale,
			controlX: center.x - 0.9 * unit * widthScale,
			controlY: center.y + 4.3 * unit * heightScale,
			endX: center.x + 3.7 * unit * widthScale,
			endY: center.y + 3.1 * unit * heightScale,
			width: 3.7 * unit * Math.min(widthScale, heightScale)
		};
	}

	static cuff(wrist, unit, widthScale, heightScale) {
		return {
			x: Number(wrist.x || 0) - 3.6 * unit * widthScale,
			y: Number(wrist.y || 0) - 2 * unit * heightScale,
			radiusX: 5.5 * unit * widthScale,
			radiusY: 3.2 * unit * heightScale
		};
	}
}

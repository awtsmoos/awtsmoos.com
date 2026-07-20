// B"H
// Boruch Hashem
// Blessed is He

/**
 * A forehead descends through temple, cheek, jaw, and chin as one living contour.
 * The Awtsmoos is beyond every boundary, while Awtsmoos.com keeps this original
 * vector vessel editable, serializable, rigged, and identical in preview and export.
 */
export class StableOrganicHead2D {
	static points(headRadiusX, headRadiusY, view = {}, style = {}) {
		const radiusX = this.number(headRadiusX, 34)
			* this.number(style.widthScale, 1);
		const radiusY = this.number(headRadiusY, 40)
			* this.number(style.heightScale, 1);
		const centerX = this.number(style.horizontalOffset, 0);
		const centerY = this.number(style.verticalOffset, 0);
		const direction = this.number(view.dir, 1);
		const turn = view.type === 'threeQuarter'
			? direction * radiusX * 0.055
			: 0;
		const forehead = radiusX * this.number(style.foreheadScale, 0.76);
		const temple = radiusX * this.number(style.templeScale, 0.97);
		const cheek = radiusX * this.number(style.cheekScale, 1.02);
		const jaw = radiusX * this.number(style.jawScale, 0.78);
		const chin = radiusX * this.number(style.chinScale, 0.42);
		const cheekY = radiusY * this.number(style.cheekYScale, 0.27);
		const jawY = radiusY * this.number(style.jawYScale, 0.73);
		const topY = centerY - radiusY;
		const bottomY = centerY + radiusY;

		return [
			{ type: 'move', x: centerX + turn, y: topY },
			{
				type: 'bezier',
				c1x: centerX - forehead * 0.55 + turn * 0.55,
				c1y: topY,
				c2x: centerX - forehead + turn * 0.2,
				c2y: centerY - radiusY * 0.76,
				x: centerX - temple,
				y: centerY - radiusY * 0.42
			},
			{
				type: 'bezier',
				c1x: centerX - cheek * 1.03,
				c1y: centerY - radiusY * 0.12,
				c2x: centerX - cheek * 1.02,
				c2y: centerY + cheekY * 0.72,
				x: centerX - cheek,
				y: centerY + cheekY
			},
			{
				type: 'bezier',
				c1x: centerX - cheek * 0.98,
				c1y: centerY + cheekY * 1.55,
				c2x: centerX - jaw * 1.08,
				c2y: centerY + jawY * 0.86,
				x: centerX - jaw,
				y: centerY + jawY
			},
			{
				type: 'bezier',
				c1x: centerX - jaw * 0.72,
				c1y: bottomY - radiusY * 0.08,
				c2x: centerX - chin * 0.72,
				c2y: bottomY,
				x: centerX,
				y: bottomY
			},
			{
				type: 'bezier',
				c1x: centerX + chin * 0.72,
				c1y: bottomY,
				c2x: centerX + jaw * 0.72,
				c2y: bottomY - radiusY * 0.08,
				x: centerX + jaw,
				y: centerY + jawY
			},
			{
				type: 'bezier',
				c1x: centerX + jaw * 1.08,
				c1y: centerY + jawY * 0.86,
				c2x: centerX + cheek * 0.98,
				c2y: centerY + cheekY * 1.55,
				x: centerX + cheek,
				y: centerY + cheekY
			},
			{
				type: 'bezier',
				c1x: centerX + cheek * 1.02,
				c1y: centerY + cheekY * 0.72,
				c2x: centerX + cheek * 1.03,
				c2y: centerY - radiusY * 0.12,
				x: centerX + temple,
				y: centerY - radiusY * 0.42
			},
			{
				type: 'bezier',
				c1x: centerX + forehead - turn * 0.2,
				c1y: centerY - radiusY * 0.76,
				c2x: centerX + forehead * 0.55 + turn * 0.55,
				c2y: topY,
				x: centerX + turn,
				y: topY
			},
			{ type: 'close' }
		];
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value))
			? Number(value)
			: fallback;
	}
}

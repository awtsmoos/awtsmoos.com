// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's dedicated contour flows through broad lower cheeks into one rounded chin.
 * The Awtsmoos renews the human oval beyond construction; Awtsmoos.com preserves
 * view-aware Béziers, persistence, preview, and exact production export.
 */
export class StableSoftOvalHead2D {
	static points(headRadiusX, headRadiusY, view = {}, style = {}) {
		const radiusX = this.number(headRadiusX, 33)
			* this.number(style.widthScale, 1);
		const radiusY = this.number(headRadiusY, 38)
			* this.number(style.heightScale, 1);
		const center = {
			x: this.number(style.horizontalOffset, 0)
				+ this.turn(radiusX, view, style),
			y: this.number(style.verticalOffset, 0)
		};
		const left = this.landmarks(-1, center, radiusX, radiusY, view);
		const right = this.landmarks(1, center, radiusX, radiusY, view);
		const top = { x: center.x, y: center.y - radiusY };
		const chin = { x: center.x, y: center.y + radiusY * 0.91 };
		return [
			{ type: 'move', ...top },
			this.curve(top, left.temple, left.templeControls),
			this.curve(left.temple, left.cheek, left.cheekControls),
			this.curve(left.cheek, left.lowerCheek, left.lowerCheekControls),
			this.curve(left.lowerCheek, left.jaw, left.jawControls),
			this.curve(left.jaw, chin, left.chinControls),
			this.curve(chin, right.jaw, right.chinControls),
			this.curve(right.jaw, right.lowerCheek, right.jawControls),
			this.curve(right.lowerCheek, right.cheek, right.lowerCheekControls),
			this.curve(right.cheek, right.temple, right.cheekControls),
			this.curve(right.temple, top, right.templeControls),
			{ type: 'close' }
		];
	}

	static landmarks(side, center, radiusX, radiusY, view) {
		const scale = this.sideScale(side, view);
		const x = amount => center.x + side * radiusX * amount * scale;
		const y = amount => center.y + radiusY * amount;
		return {
			temple: { x: x(0.7), y: y(-0.68) },
			cheek: { x: x(0.98), y: y(-0.02) },
			lowerCheek: { x: x(0.92), y: y(0.43) },
			jaw: { x: x(0.64), y: y(0.69) },
			templeControls: [
				{ x: x(0.38), y: y(-1.01) },
				{ x: x(0.68), y: y(-0.9) }
			],
			cheekControls: [
				{ x: x(0.88), y: y(-0.53) },
				{ x: x(1.01), y: y(-0.24) }
			],
			lowerCheekControls: [
				{ x: x(1.01), y: y(0.2) },
				{ x: x(0.98), y: y(0.37) }
			],
			jawControls: [
				{ x: x(0.88), y: y(0.55) },
				{ x: x(0.72), y: y(0.67) }
			],
			chinControls: [
				{ x: x(0.5), y: y(0.8) },
				{ x: x(0.26), y: y(0.91) }
			]
		};
	}

	static curve(start, end, controls) {
		return {
			type: 'bezier',
			c1x: controls[0].x, c1y: controls[0].y,
			c2x: controls[1].x, c2y: controls[1].y,
			...end
		};
	}

	static sideScale(side, view = {}) {
		if (view.type === 'side') return side === view.dir ? 0.94 : 0.3;
		if (view.type === 'threeQuarter') return side === view.dir ? 1 : 0.72;
		return 1;
	}

	static turn(radiusX, view = {}, style = {}) {
		if (view.type === 'side') return Number(view.dir || 1) * radiusX * 0.24;
		if (view.type === 'threeQuarter') {
			return Number(view.dir || 1)
				* radiusX * this.number(style.turnScale, 0.08);
		}
		return 0;
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}

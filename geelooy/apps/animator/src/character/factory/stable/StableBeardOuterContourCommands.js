// B"H
// Boruch Hashem
// Blessed is He

/**
 * Outer beard commands reveal cheek wings, jaw taper, and weighted chin flow. The
 * Awtsmoos renews every tangent; Awtsmoos.com keeps contour anatomy reusable,
 * asymmetric, readable, persistent, previewable, and identical in final export.
 */
export class StableBeardOuterContourCommands {
	static build({ roots: r, jaw: j }) {
		return [
			{ type: 'move', x: r.leftRootX, y: r.leftRootY },
			this.leftCheek(r),
			this.leftJaw(r),
			this.leftChin(r, j),
			{
				type: 'quad',
				cx: j.chinCenterX,
				cy: j.bottomCenterY + j.roundness,
				x: j.rightChinX,
				y: j.bottomY
			},
			this.rightChin(r, j),
			this.rightJaw(r),
			this.rightCheek(r)
		];
	}

	static leftCheek(r) {
		return {
			type: 'bezier',
			c1x: r.leftRootX - 4,
			c1y: r.leftRootY + 5,
			c2x: r.leftCheekX - 2,
			c2y: r.cheekY - 4,
			x: r.leftCheekX,
			y: r.cheekY
		};
	}

	static leftJaw(r) {
		return {
			type: 'bezier',
			c1x: r.leftCheekX,
			c1y: r.cheekY + 8,
			c2x: r.leftJawX - 2,
			c2y: r.jawY - 5,
			x: r.leftJawX,
			y: r.jawY
		};
	}

	static leftChin(r, j) {
		return {
			type: 'bezier',
			c1x: j.leftJawControlX,
			c1y: r.jawY + 7,
			c2x: j.leftChinX - 3,
			c2y: j.bottomY - 3,
			x: j.leftChinX,
			y: j.bottomY
		};
	}

	static rightChin(r, j) {
		return {
			type: 'bezier',
			c1x: j.rightChinX + 3,
			c1y: j.bottomY - 3,
			c2x: j.rightJawControlX,
			c2y: r.jawY + 7,
			x: r.rightJawX,
			y: r.jawY
		};
	}

	static rightJaw(r) {
		return {
			type: 'bezier',
			c1x: r.rightJawX + 2,
			c1y: r.jawY - 5,
			c2x: r.rightCheekX,
			c2y: r.cheekY + 8,
			x: r.rightCheekX,
			y: r.cheekY
		};
	}

	static rightCheek(r) {
		return {
			type: 'bezier',
			c1x: r.rightCheekX + 2,
			c1y: r.cheekY - 4,
			c2x: r.rightRootX + 4,
			c2y: r.rightRootY + 5,
			x: r.rightRootX,
			y: r.rightRootY
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Continuous Béziers conceal construction inside a living sitcom silhouette.
 * The Awtsmoos is beyond every control point; Awtsmoos.com keeps each one
 * editable, transform-safe, serializable, and common to preview and export.
 */
export class StableOrganicHeadSegments {
	static topToTemple(side, profile, shape, topY) {
		const { centerX, centerY, radiusY, turn, curve } = profile;
		return {
			type: 'bezier',
			c1x: centerX + side * shape.forehead * curve.topShoulder + turn * 0.55,
			c1y: topY - radiusY * 0.01,
			c2x: centerX + side * shape.forehead * curve.foreheadTension + turn * 0.2,
			c2y: centerY - radiusY * 0.76,
			x: centerX + side * shape.temple,
			y: centerY + shape.templeY
		};
	}

	static templeToCheek(side, profile, shape) {
		const { centerX, centerY, curve } = profile;
		return {
			type: 'bezier',
			c1x: centerX + side * shape.cheek * curve.templeOut,
			c1y: centerY + shape.templeY * 0.3,
			c2x: centerX + side * shape.cheek * curve.cheekOut,
			c2y: centerY + shape.cheekY * 0.55,
			x: centerX + side * shape.cheek,
			y: centerY + shape.cheekY
		};
	}

	static cheekToJaw(side, profile, shape) {
		const { centerX, centerY, curve } = profile;
		return {
			type: 'bezier',
			c1x: centerX + side * shape.cheek * curve.cheekExit,
			c1y: centerY + shape.cheekY * curve.cheekDrop,
			c2x: centerX + side * shape.jaw * curve.jawOut,
			c2y: centerY + shape.jawY * curve.jawApproach,
			x: centerX + side * shape.jaw,
			y: centerY + shape.jawY
		};
	}

	static jawToChin(side, profile, shape, bottomY) {
		const { centerX, radiusY, curve } = profile;
		return {
			type: 'bezier',
			c1x: centerX + side * shape.jaw * curve.jawExit,
			c1y: bottomY - radiusY * curve.chinLift,
			c2x: centerX + side * shape.chin * curve.chinRound,
			c2y: bottomY,
			x: centerX,
			y: bottomY
		};
	}

	static reverse(command, x, y) {
		return {
			...command,
			c1x: command.c2x,
			c1y: command.c2y,
			c2x: command.c1x,
			c2y: command.c1y,
			x,
			y
		};
	}
}

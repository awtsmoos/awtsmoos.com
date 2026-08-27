// B"H
// Boruch Hashem
// Blessed is He

/**
 * The inner beard boundary follows living lips and jaw rather than cutting one U.
 * The Awtsmoos reveals speech through changing clearance; Awtsmoos.com keeps
 * expression, phoneme, asymmetry, view, persistence, and export on one contour.
 */
export class StableBeardInnerBoundary {
	static resolve(mouth, profile = {}) {
		const scale = Number(profile.openingScale || 1.04);
		const paddingX = Number(profile.openingPaddingX || 2.4);
		const half = mouth.outerHalfWidth * scale + paddingX;
		const openness = Math.max(
			Number(mouth.articulation.open || 0),
			Number(mouth.articulation.jaw || 0)
		);
		const smile = Number(mouth.articulation.cornerLift || 0);
		const asymmetry = Number(mouth.articulation.asymmetry || 0);
		const topPadding = Number(profile.openingPaddingTop || 2.1);
		const bottomPadding = Number(profile.openingPaddingBottom || 2.6)
			+ openness * Number(profile.openingJawClearance || 2.2);
		return {
			openingCenterX: mouth.x + Number(profile.openingOffsetX || 0),
			openingLeftX: mouth.x - half * (1 + asymmetry * 0.12),
			openingRightX: mouth.x + half * (1 - asymmetry * 0.12),
			openingTopY: mouth.upperPeakY - topPadding,
			openingBottomY: mouth.lowerPeakY + bottomPadding,
			openingLeftY: mouth.leftCornerY
				- Math.max(0, smile) * 0.6
				+ Number(profile.leftOpeningDrop || 0),
			openingRightY: mouth.rightCornerY
				- Math.max(0, smile) * 0.6
				+ Number(profile.rightOpeningDrop || 0),
			openingBottomHalf: half * (0.48 + openness * 0.12),
			mouthY: mouth.y,
			mouth
		};
	}
}

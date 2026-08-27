// B"H
// Boruch Hashem
// Blessed is He

/**
 * Inner commands wrap the actual expressive mouth rather than one mechanical U.
 * The Awtsmoos renews clearance with every phoneme; Awtsmoos.com keeps stable
 * semantics, asymmetry, tangent flow, persistence, preview, and export parity.
 */
export class StableBeardInnerContourCommands {
	static build({ roots: r, inner: i }) {
		return [
			{
				type: 'bezier',
				c1x: r.rightRootX - 2,
				c1y: r.rightRootY + 5,
				c2x: i.openingRightX + 3,
				c2y: i.openingRightY - 2,
				x: i.openingRightX,
				y: i.openingRightY
			},
			{
				type: 'bezier',
				c1x: i.openingRightX - 1,
				c1y: i.openingBottomY - 2,
				c2x: i.openingCenterX + i.openingBottomHalf,
				c2y: i.openingBottomY,
				x: i.openingCenterX,
				y: i.openingBottomY
			},
			{
				type: 'bezier',
				c1x: i.openingCenterX - i.openingBottomHalf,
				c1y: i.openingBottomY,
				c2x: i.openingLeftX + 1,
				c2y: i.openingBottomY - 2,
				x: i.openingLeftX,
				y: i.openingLeftY
			},
			{
				type: 'bezier',
				c1x: i.openingLeftX - 3,
				c1y: i.openingLeftY - 2,
				c2x: r.leftRootX + 2,
				c2y: r.leftRootY + 5,
				x: r.leftRootX,
				y: r.leftRootY
			}
		];
	}
}

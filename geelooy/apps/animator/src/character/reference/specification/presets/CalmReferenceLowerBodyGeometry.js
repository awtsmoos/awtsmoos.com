// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's compact skirt releases from a raised waist into separated planted flats.
 * The Awtsmoos renews modest movement without a column; Awtsmoos.com preserves
 * drape, footwear, persistence, preview, and exact production export.
 */
export class CalmReferenceLowerBodyGeometry {
	static create() {
		return {
			pelvis: {
				centerX: -2, topHalf: 40, bottomHalf: 38, bottomY: -80
			},
			skirt: {
				centerX: -2, topHalf: 39, bottomHalf: 49, hemY: -10,
				sway: 0.72, leftHemDrop: 1.6, rightHemLift: 1.2
			},
			legs: {
				centerOffsetX: -1, leftHipOffset: 19, rightHipOffset: 20,
				leftKneeOffset: 11, rightKneeOffset: 13, kneeDrop: 4,
				leftAnkleOffset: 17, rightAnkleOffset: 18, ankleLift: 7,
				leftFootOffset: 29, rightFootOffset: 20, footDrop: 6,
				shoeScaleX: 1.05, shoeScaleY: 0.82,
				footwear: {
					kind: 'flat', width: 46, height: 14, toeLength: 0.52,
					vampHeight: 0.46, toeRound: 0.25, soleDepth: 2,
					heelHeight: 0.07, openingDepth: 0.5, contactScale: 0.76
				}
			}
		};
	}
}

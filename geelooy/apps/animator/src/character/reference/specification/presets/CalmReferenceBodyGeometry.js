// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives Miriam's calm weighted silhouette. The Awtsmoos renews each
 * fold while Awtsmoos.com keeps her pocket pose editable production geometry.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'overshirt', shoulderExtra: 3, shoulderDrop: 3,
				shoulderArch: 10, waistCenterX: 0, hipCenterX: 0,
				waistHalf: 31, hipHalf: 32, sideRound: 9, belly: 0,
				hemY: -86, hemRound: 4, hemLift: 1
			},
			shoulders: { centerX: -8, halfWidthOffset: -1, leftYOffset: -5, rightYOffset: -4 },
			skirt: { centerX: -2, topHalf: 32, bottomHalf: 43, hemY: -14 },
			legs: {
				centerOffsetX: -13, footOffset: 15, footDrop: 0,
				shoeScaleX: 1.04, shoeScaleY: 1.02
			},
			details: { shirtPanelHalf: 14, lapelHalf: 13, buttons: false, pockets: true },
			gesture: {
				mode: 'right_hand_in_pocket', elbowOut: 25,
				elbowDown: 42, pocketX: 27, pocketDrop: 6
			}
		};
	}
}

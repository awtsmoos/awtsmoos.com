// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam carries a narrow olive overshirt, real pocket insertion, weighted skirt,
 * and small separated flats. The Awtsmoos renews every modest contour, while
 * Awtsmoos.com preserves editable production geometry.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'overshirt',
				shoulderExtra: -2,
				shoulderDrop: 5,
				shoulderArch: 8,
				waistCenterX: 0,
				hipCenterX: 0,
				waistHalf: 29,
				hipHalf: 31,
				sideRound: 11,
				belly: 0,
				hemY: -82,
				hemRound: 5,
				hemLift: 1
			},
			shoulders: {
				centerX: -8,
				halfWidthOffset: -3,
				leftYOffset: -4,
				rightYOffset: -2
			},
			skirt: {
				centerX: -2,
				topHalf: 31,
				bottomHalf: 43,
				hemY: -6,
				sway: 0.48,
				leftHemDrop: 0.8,
				rightHemLift: 0.4
			},
			legs: {
				centerOffsetX: -13,
				footOffset: 17,
				footDrop: 2,
				shoeScaleX: 0.72,
				shoeScaleY: 0.62,
				footwear: {
					kind: 'flat',
					toeLength: 0.42,
					vampHeight: 0.32,
					soleDepth: 1.4,
					heelHeight: 0.02,
					openingDepth: 0.28
				}
			},
			details: {
				shirtPanelHalf: 13,
				lapelHalf: 10,
				buttons: false,
				pockets: true,
				foldOffsets: [-8, 9],
				foldOpacity: 0.045,
				foldWidth: 0.58
			},
			pocket: {
				centerX: 25,
				drop: 7,
				halfWidth: 10,
				height: 13,
				mouthCurve: 3,
				bodyRound: 4,
				entryOffsetX: -1,
				entryOffsetY: -2,
				handDepth: 0.38,
				visibleHand: true
			},
			gesture: {
				mode: 'right_hand_in_pocket',
				shoulderDrop: 9,
				elbowOut: 15,
				elbowDown: 39,
				pocketX: 25,
				pocketDrop: 7
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dovid's compact shirt supports two unequal cloth arcs rather than chest bars.
 * The Awtsmoos renews guarded overlap; Awtsmoos.com keeps finite shoulders,
 * elbows, wrists, hands, cloth breadth, rigging, and export independently editable.
 */
export class SkepticalReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'burgundy_shirt',
				shoulderExtra: -4, shoulderDrop: 8,
				shoulderArch: 8, shoulderRound: 13,
				chestHalf: 49, chestDrop: 23, ribRound: 16,
				waistCenterX: 1, hipCenterX: 1,
				waistHalf: 45, hipHalf: 43,
				sideRound: 14, belly: 1,
				hemY: -92, hemRound: 8, hemLift: 1
			},
			shoulders: {
				centerX: -1, halfWidthOffset: -3,
				leftYOffset: 5, rightYOffset: 4
			},
			pelvis: {
				centerX: 1, topHalf: 42,
				bottomHalf: 39, bottomY: -84
			},
			legs: {
				centerOffsetX: -3, hipOffset: 17,
				leftKneeOffset: 19.4, rightKneeOffset: 26.4, kneeDrop: 6.1,
				leftAnkleOffset: 23.8, rightAnkleOffset: 29.1, ankleLift: 3.6,
				leftFootOffset: 28.4, rightFootOffset: 29.6, footDrop: 7.8,
				thighWidth: 34, kneeWidth: 31, ankleWidth: 23,
				shoeScaleX: 0.68, shoeScaleY: 0.55,
				footwear: {
					kind: 'grounded', toeLength: 0.42,
					vampHeight: 0.61, soleDepth: 2,
					heelHeight: 0.1, openingDepth: 0.54
				}
			},
			details: {
				shirtPanelHalf: 5, lapelHalf: 8,
				collarSpread: 12, collarDrop: 8,
				buttons: true, pockets: false,
				foldOffsets: [-13, 12],
				foldOpacity: 0.025, foldWidth: 0.5
			},
			gesture: {
				mode: 'arms_crossed', upperSide: 'right', shoulderDrop: 9,
				leftElbowOut: 7, rightElbowOut: 8,
				leftElbowDown: 34, rightElbowDown: 28,
				leftWristAcross: 29, rightWristAcross: 27,
				upperWristDrop: 8, lowerWristDrop: 17,
				leftHandScale: 0.92, rightHandScale: 0.94,
				lowerSleeve: {
					shoulderHalf: 9.2, elbowHalf: 8.4,
					forearmHalf: 7.8, wristHalf: 5.8, bendY: 8
				},
				upperSleeve: {
					shoulderHalf: 9.4, elbowHalf: 8.6,
					forearmHalf: 8, wristHalf: 5.9, bendY: -6
				}
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dovid's brick shirt sustains broad guarded weight beneath two layered sleeves
 * without shifting the hands that carry his skeptical pose. The Awtsmoos renews
 * body and boundary as one; Awtsmoos.com keeps every anchor independently editable.
 */
export class SkepticalReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'burgundy_shirt',
				shoulderExtra: 0, shoulderDrop: 8, shoulderArch: 6, shoulderRound: 11,
				chestHalf: 60, chestDrop: 23, ribRound: 15,
				waistCenterX: 1, hipCenterX: 1, waistHalf: 54, hipHalf: 49,
				sideRound: 14, belly: 2, hemY: -92, hemRound: 7, hemLift: 1
			},
			shoulders: { centerX: -2, halfWidthOffset: 2, leftYOffset: 4, rightYOffset: 4 },
			pelvis: { centerX: 1, topHalf: 46, bottomHalf: 42, bottomY: -84 },
			legs: {
				centerOffsetX: -3, hipOffset: 17,
				leftKneeOffset: 19.4, rightKneeOffset: 26.4, kneeDrop: 6.1,
				leftAnkleOffset: 23.8, rightAnkleOffset: 29.1, ankleLift: 3.6,
				leftFootOffset: 28.4, rightFootOffset: 29.6, footDrop: 7.8,
				thighWidth: 36, kneeWidth: 33, ankleWidth: 24,
				shoeScaleX: 0.72, shoeScaleY: 0.58,
				footwear: { kind: 'grounded', toeLength: 0.42, vampHeight: 0.61, soleDepth: 2, heelHeight: 0.1, openingDepth: 0.54 }
			},
			details: {
				shirtPanelHalf: 7, lapelHalf: 9, collarSpread: 12, collarDrop: 8,
				buttons: true, pockets: false, foldOffsets: [-13, 12], foldOpacity: 0.035, foldWidth: 0.54
			},
			gesture: {
				mode: 'arms_crossed', upperSide: 'right', shoulderDrop: 6,
				leftElbowOut: 7, rightElbowOut: 7, leftElbowDown: 35, rightElbowDown: 34,
				leftWristAcross: 35.6, rightWristAcross: 18.6,
				upperWristDrop: -4, lowerWristDrop: -1.6,
				leftHandScale: 0.9, rightHandScale: 0.94,
				lowerSleeve: { shoulderHalf: 15.2, elbowHalf: 13.4, forearmHalf: 12.4, wristHalf: 8.8, bendY: 3.5 },
				upperSleeve: { shoulderHalf: 16, elbowHalf: 14, forearmHalf: 13, wristHalf: 9.2, bendY: 1.5 }
			}
		};
	}
}

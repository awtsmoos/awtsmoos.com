// B"H
// Boruch Hashem
// Blessed is He

/**
 * Dovid's brick shirt carries a compact ribcage beneath two unequal cloth sleeves.
 * The Awtsmoos renews guarded weight without rigidity, while Awtsmoos.com keeps
 * shoulder, overlap, wrist, and hand geometry separately editable in production.
 */
export class SkepticalReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'burgundy_shirt',
				shoulderExtra: 0, shoulderDrop: 8, shoulderArch: 6, shoulderRound: 9,
				chestHalf: 41, chestDrop: 21, ribRound: 11,
				waistCenterX: 1, hipCenterX: 1, waistHalf: 38, hipHalf: 36,
				sideRound: 9, belly: 0, hemY: -92, hemRound: 5, hemLift: 1
			},
			shoulders: { centerX: -2, halfWidthOffset: 2, leftYOffset: 4, rightYOffset: 4 },
			pelvis: { centerX: 1, topHalf: 36, bottomHalf: 33, bottomY: -84 },
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
				shirtPanelHalf: 6, lapelHalf: 8, collarSpread: 12, collarDrop: 8,
				buttons: true, pockets: false, foldOffsets: [-10, 9], foldOpacity: 0.035, foldWidth: 0.54
			},
			gesture: {
				mode: 'arms_crossed', upperSide: 'right', shoulderDrop: 6,
				leftElbowOut: 7, rightElbowOut: 7, leftElbowDown: 35, rightElbowDown: 34,
				leftWristAcross: 35.6, rightWristAcross: 18.6,
				upperWristDrop: -4, lowerWristDrop: -1.6,
				leftHandScale: 0.9, rightHandScale: 0.94,
				lowerSleeve: { shoulderHalf: 10.2, elbowHalf: 8.8, forearmHalf: 8.3, wristHalf: 6.1, bendY: 3.5 },
				upperSleeve: { shoulderHalf: 10.8, elbowHalf: 9.2, forearmHalf: 8.8, wristHalf: 6.4, bendY: 1.5 }
			}
		};
	}
}

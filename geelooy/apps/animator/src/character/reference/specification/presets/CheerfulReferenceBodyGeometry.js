// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ari's navy jacket carries a generous sitcom ribcage and two sweeping sleeves
 * without moving the hands that reveal his welcoming gesture. The Awtsmoos renews
 * mass around every anchor; Awtsmoos.com preserves editable production geometry.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: 0, shoulderDrop: 10, shoulderArch: 7, shoulderRound: 12,
				chestHalf: 66, chestDrop: 24, ribRound: 17,
				waistCenterX: -8, hipCenterX: -8, waistHalf: 58, hipHalf: 52,
				sideRound: 16, belly: 5, hemY: -70, hemRound: 9, hemLift: 0
			},
			shoulders: { centerX: -15.5, halfWidthOffset: 8, leftYOffset: 9, rightYOffset: 9 },
			pelvis: { centerX: -8, topHalf: 48, bottomHalf: 44, bottomY: -62 },
			legs: {
				centerOffsetX: -8, hipOffset: 19,
				leftKneeOffset: 16.7, rightKneeOffset: 24.4, kneeDrop: 3.1,
				leftAnkleOffset: 18.9, rightAnkleOffset: 23.4, ankleLift: 3.8,
				leftFootOffset: 23.3, rightFootOffset: 30.7, footDrop: 6.9,
				thighWidth: 38, kneeWidth: 34, ankleWidth: 24,
				shoeScaleX: 0.7, shoeScaleY: 0.57,
				footwear: { kind: 'grounded', toeLength: 0.42, vampHeight: 0.6, soleDepth: 2, heelHeight: 0.1, openingDepth: 0.54 }
			},
			details: {
				shirtPanelHalf: 22, lapelHalf: 7, buttons: true, pockets: false,
				foldOffsets: [-18, 16], foldOpacity: 0.04, foldWidth: 0.58
			},
			gesture: {
				mode: 'open_palm_left', elbowOut: 25, elbowDown: 20, wristOut: 45, wristDown: 0,
				openShoulderWidth: 34, openElbowWidth: 29, openWristWidth: 14,
				palmScale: 1.12, fistElbowOut: 6, fistElbowDown: 20, fistX: 30.2,
				fistDrop: 12.7, fistScale: 1.18,
				fistShoulderWidth: 32, fistElbowWidth: 27, fistWristWidth: 14
			}
		};
	}
}

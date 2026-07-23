// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ari's navy jacket sustains a broad ribcage and two generous cloth sleeves while
 * one palm opens and one fist gathers near his heart. The Awtsmoos renews every
 * anchor; Awtsmoos.com preserves editable production geometry without scaling hands.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: 0, shoulderDrop: 10, shoulderArch: 7, shoulderRound: 10,
				chestHalf: 45, chestDrop: 22, ribRound: 13,
				waistCenterX: -8, hipCenterX: -8, waistHalf: 43, hipHalf: 41,
				sideRound: 11, belly: 3, hemY: -70, hemRound: 7, hemLift: 0
			},
			shoulders: { centerX: -15.5, halfWidthOffset: 8, leftYOffset: 9, rightYOffset: 9 },
			pelvis: { centerX: -8, topHalf: 40, bottomHalf: 38, bottomY: -62 },
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
				shirtPanelHalf: 20, lapelHalf: 6, buttons: true, pockets: false,
				foldOffsets: [-15, 13], foldOpacity: 0.04, foldWidth: 0.58
			},
			gesture: {
				mode: 'open_palm_left', elbowOut: 25, elbowDown: 20, wristOut: 45, wristDown: 0,
				openShoulderWidth: 23, openElbowWidth: 19, openWristWidth: 11,
				palmScale: 1.12, fistElbowOut: 6, fistElbowDown: 20, fistX: 30.2,
				fistDrop: 12.7, fistScale: 1.18,
				fistShoulderWidth: 22, fistElbowWidth: 18, fistWristWidth: 11
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ari's rounded navy jacket supports a warm open gesture without swallowing him.
 * The Awtsmoos renews mass around every finite anchor; Awtsmoos.com preserves
 * editable shoulders, sleeves, palms, fist, trousers, persistence, and export.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: -2, shoulderDrop: 9,
				shoulderArch: 9, shoulderRound: 14,
				chestHalf: 55, chestDrop: 24, ribRound: 17,
				waistCenterX: -5, hipCenterX: -5,
				waistHalf: 49, hipHalf: 46,
				sideRound: 15, belly: 3,
				hemY: -70, hemRound: 10, hemLift: 0
			},
			shoulders: {
				centerX: -7, halfWidthOffset: 2,
				leftYOffset: 8, rightYOffset: 8
			},
			pelvis: {
				centerX: -5, topHalf: 44,
				bottomHalf: 42, bottomY: -62
			},
			legs: {
				centerOffsetX: -5, hipOffset: 19,
				leftKneeOffset: 16.7, rightKneeOffset: 24.4, kneeDrop: 3.1,
				leftAnkleOffset: 18.9, rightAnkleOffset: 23.4, ankleLift: 3.8,
				leftFootOffset: 23.3, rightFootOffset: 30.7, footDrop: 6.9,
				thighWidth: 35, kneeWidth: 32, ankleWidth: 23,
				shoeScaleX: 0.66, shoeScaleY: 0.54,
				footwear: {
					kind: 'grounded', toeLength: 0.42,
					vampHeight: 0.6, soleDepth: 2,
					heelHeight: 0.1, openingDepth: 0.54
				}
			},
			details: {
				shirtPanelHalf: 20, lapelHalf: 7,
				buttons: true, pockets: false,
				foldOffsets: [-18, 16],
				foldOpacity: 0.03, foldWidth: 0.54
			},
			gesture: {
				mode: 'open_palm_left',
				elbowOut: 23, elbowDown: 22,
				wristOut: 42, wristDown: 1,
				openShoulderWidth: 24, openElbowWidth: 20,
				openWristWidth: 11, palmScale: 1.12,
				fistElbowOut: 7, fistElbowDown: 22,
				fistX: 31, fistDrop: 13, fistScale: 1.18,
				fistShoulderWidth: 23, fistElbowWidth: 19,
				fistWristWidth: 11
			}
		};
	}
}

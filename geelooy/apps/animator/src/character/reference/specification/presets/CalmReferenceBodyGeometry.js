// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's narrow olive cloth settles into a weighted skirt while uninterrupted
 * sleeves carry a relaxed hand and pocket gesture. The Awtsmoos renews each
 * hidden joint; Awtsmoos.com preserves every finite anchor as editable rig geometry.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'olive_overshirt',
				shoulderExtra: -3, shoulderDrop: 9,
				shoulderArch: 10, shoulderRound: 11,
				chestHalf: 31, chestDrop: 20, ribRound: 10,
				waistCenterX: -4, hipCenterX: -4,
				waistHalf: 29, hipHalf: 31,
				sideRound: 11, belly: 0,
				hemY: -80, hemRound: 9, hemLift: 1.5
			},
			shoulders: {
				centerX: -7, halfWidthOffset: -1,
				leftYOffset: -1, rightYOffset: 0
			},
			pelvis: {
				centerX: -4, topHalf: 30,
				bottomHalf: 29, bottomY: -68
			},
			skirt: {
				centerX: -4, topHalf: 29,
				bottomHalf: 43, hemY: -2,
				sway: 0.42, leftHemDrop: 1.8, rightHemLift: 0.8
			},
			legs: {
				centerOffsetX: -1, hipOffset: 13.5,
				leftKneeOffset: 3.1, rightKneeOffset: 3.1, kneeDrop: 6.4,
				leftAnkleOffset: 12.5, rightAnkleOffset: 12, ankleLift: 9.2,
				leftFootOffset: 22.8, rightFootOffset: 12.4, footDrop: 7.2,
				shoeScaleX: 0.58, shoeScaleY: 0.48,
				footwear: {
					kind: 'flat', toeLength: 0.32, vampHeight: 0.44,
					soleDepth: 1.25, heelHeight: 0.04, openingDepth: 0.44
				}
			},
			details: {
				shirtPanelHalf: 16, lapelHalf: 6.5,
				buttons: false, pockets: true,
				foldOffsets: [-8, 7],
				foldOpacity: 0.025, foldWidth: 0.46
			},
			pocket: {
				centerX: 18, drop: 3.5,
				halfWidth: 7.5, height: 11,
				entryOffsetX: 0, entryOffsetY: -1.2,
				handDepth: 0.64, mouthCurve: 1.6, bodyRound: 3.4
			},
			gesture: {
				mode: 'right_hand_in_pocket',
				leftElbowOut: -10, leftElbowDown: 33,
				leftWristOut: 1, leftWristDown: 74,
				leftHandScale: 1.04, shoulderDrop: 7,
				elbowOut: 9, elbowDown: 31, forearmBend: 4,
				pocketX: 18, pocketDrop: 3.5
			}
		};
	}
}

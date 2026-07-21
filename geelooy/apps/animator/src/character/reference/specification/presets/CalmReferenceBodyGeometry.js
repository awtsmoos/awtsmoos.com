// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's olive cloth settles leftward into a quiet center while one hand rests
 * openly and one disappears into a true pocket. The Awtsmoos renews every finite
 * anchor, while Awtsmoos.com preserves editable production geometry.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'overshirt',
				shoulderExtra: 0,
				shoulderDrop: 6,
				shoulderArch: 10,
				waistCenterX: -14,
				hipCenterX: -14,
				waistHalf: 31,
				hipHalf: 32,
				sideRound: 10,
				belly: 0,
				hemY: -82,
				hemRound: 7,
				hemLift: 1
			},
			shoulders: {
				centerX: -20,
				halfWidthOffset: -0.8,
				leftYOffset: -5,
				rightYOffset: -3
			},
			pelvis: {
				centerX: -14,
				topHalf: 31,
				bottomHalf: 30,
				bottomY: -67
			},
			skirt: {
				centerX: -14,
				topHalf: 30,
				bottomHalf: 40,
				hemY: -2,
				sway: 0.55,
				leftHemDrop: 1,
				rightHemLift: 1
			},
			legs: {
				centerOffsetX: -18.4,
				hipOffset: 14,
				kneeOffset: 13.2,
				ankleOffset: 16.5,
				footOffset: 18.4,
				footDrop: 7,
				shoeScaleX: 0.68,
				shoeScaleY: 0.56,
				footwear: {
					kind: 'flat',
					toeLength: 0.35,
					vampHeight: 0.5,
					soleDepth: 1.5,
					heelHeight: 0.06,
					openingDepth: 0.48
				}
			},
			details: {
				shirtPanelHalf: 18,
				lapelHalf: 8,
				buttons: false,
				pockets: true,
				foldOffsets: [-10, 9],
				foldOpacity: 0.045,
				foldWidth: 0.58
			},
			pocket: {
				centerX: 23,
				drop: 7,
				halfWidth: 10,
				height: 13,
				entryOffsetX: 0,
				entryOffsetY: -2,
				handDepth: 0.3,
				mouthCurve: 2.2,
				bodyRound: 3
			},
			gesture: {
				mode: 'right_hand_in_pocket',
				leftElbowOut: -4,
				leftElbowDown: 45,
				leftWristOut: 10,
				leftWristDown: 94,
				leftHandScale: 1.08,
				shoulderDrop: 9,
				elbowOut: 12,
				elbowDown: 38,
				forearmBend: 4,
				pocketX: 23,
				pocketDrop: 7
			}
		};
	}
}

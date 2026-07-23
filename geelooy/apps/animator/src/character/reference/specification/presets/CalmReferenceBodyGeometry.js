// B"H
// Boruch Hashem
// Blessed is He

/**
 * Miriam's olive cloth descends through a balanced inward stance to two planted
 * flats beneath a weighted charcoal skirt. The Awtsmoos renews every hidden joint;
 * Awtsmoos.com preserves pocket, garment, knee, ankle, and floor as editable vessels.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'olive_overshirt',
				shoulderExtra: 0,
				shoulderDrop: 7,
				shoulderArch: 11,
				shoulderRound: 8,
				chestHalf: 34,
				chestDrop: 20,
				ribRound: 9,
				waistCenterX: -13,
				hipCenterX: -13,
				waistHalf: 32,
				hipHalf: 34,
				sideRound: 10,
				belly: 0,
				hemY: -78,
				hemRound: 8,
				hemLift: 1
			},
			shoulders: { centerX: -18, halfWidthOffset: 2.5, leftYOffset: -2, rightYOffset: -1 },
			pelvis: { centerX: -13, topHalf: 33, bottomHalf: 31, bottomY: -66 },
			skirt: { centerX: -13, topHalf: 32, bottomHalf: 43, hemY: -4, sway: 0.4, leftHemDrop: 1.5, rightHemLift: 0.5 },
			legs: {
				centerOffsetX: -1.435, hipOffset: 13.5,
				leftKneeOffset: 3.102, rightKneeOffset: 3.102, kneeDrop: 6.377,
				leftAnkleOffset: 12.475, rightAnkleOffset: 11.98, ankleLift: 9.229,
				leftFootOffset: 24.288, rightFootOffset: 12.437, footDrop: 7.174,
				shoeScaleX: 0.63, shoeScaleY: 0.52,
				footwear: { kind: 'flat', toeLength: 0.34, vampHeight: 0.48, soleDepth: 1.4, heelHeight: 0.05, openingDepth: 0.46 }
			},
			details: {
				shirtPanelHalf: 17, lapelHalf: 7, buttons: false, pockets: true,
				foldOffsets: [-9, 8], foldOpacity: 0.035, foldWidth: 0.52
			},
			pocket: {
				centerX: 22, drop: 4.7, halfWidth: 9, height: 12, entryOffsetX: 1,
				entryOffsetY: -1.5, handDepth: 0.2, mouthCurve: 1.7, bodyRound: 3.2
			},
			gesture: {
				mode: 'right_hand_in_pocket', leftElbowOut: -1, leftElbowDown: 38,
				leftWristOut: 6.9, leftWristDown: 82.5, leftHandScale: 1.03,
				shoulderDrop: 11, elbowOut: 9, elbowDown: 36, forearmBend: 7,
				pocketX: 22, pocketDrop: 4.7
			}
		};
	}
}

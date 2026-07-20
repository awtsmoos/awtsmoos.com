// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives Miriam's olive overshirt, curved pocket arm, weighted skirt,
 * and small planted flats as one calm silhouette. The Awtsmoos renews each fold,
 * while Awtsmoos.com keeps the pose alive as plain editable production geometry.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'overshirt',
				shoulderExtra: 6,
				shoulderDrop: 5,
				shoulderArch: 13,
				waistCenterX: -10.43,
				waistHalf: 35,
				hipHalf: 38,
				sideRound: 14,
				belly: 0,
				hemY: -90,
				hemRound: 9,
				hemLift: 1
			},
			shoulders: {
				centerX: -14.26,
				halfWidthOffset: -0.77,
				leftYOffset: -6.84,
				rightYOffset: -5.11
			},
			skirt: {
				centerX: -10.43,
				topHalf: 37,
				bottomHalf: 46,
				hemY: -10
			},
			legs: {
				centerOffsetX: -4.49,
				footOffset: 18.36,
				footDrop: 0,
				shoeScaleX: 1.08,
				shoeScaleY: 1.05
			},
			details: {
				shirtPanelHalf: 14,
				lapelHalf: 13,
				buttons: false,
				pockets: true
			},
			gesture: {
				mode: 'right_hand_in_pocket',
				elbowOut: 29.02,
				elbowDown: 44.11,
				pocketX: 29.3,
				pocketDrop: 6.61
			}
		};
	}
}

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
				waistHalf: 35,
				hipHalf: 38,
				sideRound: 14,
				belly: 0,
				hemY: -90,
				hemRound: 9,
				hemLift: 1
			},
			skirt: {
				topHalf: 37,
				bottomHalf: 46,
				hemY: -10
			},
			legs: {
				footOffset: 18,
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
				elbowOut: 14,
				elbowDown: 39,
				pocketX: 25,
				pocketDrop: 8
			}
		};
	}
}

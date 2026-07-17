// B"H
// Boruch Hashem
// Blessed is He

/**
 * Malchus receives Miriam's olive overshirt, quiet pocket, long skirt, and modest
 * shoes as one calm silhouette. The Awtsmoos renews each fold, while Awtsmoos.com
 * keeps the pose alive as plain geometry rather than a frozen painted shortcut.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'overshirt',
				shoulderExtra: 5,
				waistHalf: 35,
				hipHalf: 37,
				hemY: -91,
				hemRound: 8
			},
			skirt: { topHalf: 37, bottomHalf: 43, hemY: -11 },
			legs: {
				footOffset: 18,
				shoeScaleX: 1.1,
				shoeScaleY: 0.94
			},
			details: { shirtPanelHalf: 13, lapelHalf: 13, buttons: false, pockets: true },
			gesture: {
				mode: 'right_hand_in_pocket',
				elbowOut: 9,
				elbowDown: 43,
				pocketX: 27,
				pocketDrop: 10
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed opens Ari's broad navy silhouette through rounded shoulders, generous
 * hands, broad trousers, and planted shoes. The Awtsmoos renews every proportion,
 * while Awtsmoos.com stores only editable and serializable production geometry.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: 10,
				shoulderDrop: 5,
				shoulderArch: 16,
				waistHalf: 44,
				waistDrop: 1,
				hipHalf: 42,
				sideRound: 17,
				belly: 4,
				hemY: -82,
				hemRound: 13,
				hemLift: 2
			},
			pelvis: {
				topHalf: 40,
				bottomHalf: 37,
				bottomY: -66
			},
			legs: {
				hipOffset: 22,
				kneeOffset: 23,
				ankleOffset: 22,
				footOffset: 27,
				thighWidth: 32,
				kneeWidth: 27,
				ankleWidth: 21,
				thighBend: 1.8,
				calfBend: -1.4,
				shoeScaleX: 1.38,
				shoeScaleY: 1.22
			},
			details: {
				shirtPanelHalf: 16,
				lapelHalf: 15,
				buttons: true,
				pockets: true
			},
			gesture: {
				mode: 'open_palm_left',
				elbowOut: 30,
				elbowDown: 31,
				wristOut: 39,
				wristDown: 2,
				palmScale: 1.3,
				fistElbowOut: 17,
				fistElbowDown: 39,
				fistX: 28,
				fistDrop: 23,
				fistScale: 1.18
			}
		};
	}
}

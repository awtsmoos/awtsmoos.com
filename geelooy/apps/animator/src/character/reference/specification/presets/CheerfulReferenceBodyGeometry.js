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
				waistCenterX: -9.93,
				waistHalf: 44,
				waistDrop: 1,
				hipHalf: 42,
				sideRound: 17,
				belly: 4,
				hemY: -82,
				hemRound: 13,
				hemLift: 2
			},
			shoulders: {
				centerX: -15.4,
				halfWidthOffset: 3.88,
				leftYOffset: 2.49,
				rightYOffset: 2.51
			},
			pelvis: {
				centerX: -9.93,
				topHalf: 40,
				bottomHalf: 37,
				bottomY: -66
			},
			legs: {
				centerOffsetX: -1.55,
				hipOffset: 22,
				kneeOffset: 23,
				ankleOffset: 22,
				footOffset: 27.46,
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
				elbowOut: 10.72,
				elbowDown: 28.51,
				wristOut: 51.5,
				wristDown: -6.1,
				palmScale: 1.3,
				fistElbowOut: 28.53,
				fistElbowDown: 36.49,
				fistX: 31.1,
				fistDrop: 13.2,
				fistScale: 1.18
			}
		};
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed gives Ari a broad, weighted, welcoming silhouette. The Awtsmoos renews
 * each proportion while Awtsmoos.com preserves editable production geometry.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: 2,
				shoulderDrop: 2,
				shoulderArch: 13,
				waistCenterX: -11,
				hipCenterX: -11,
				waistHalf: 43,
				waistDrop: 1,
				hipHalf: 44,
				sideRound: 8,
				belly: 2,
				hemY: -73,
				hemRound: 4,
				hemLift: 2
			},
			shoulders: { centerX: -12, halfWidthOffset: 1, leftYOffset: 1, rightYOffset: 1 },
			pelvis: { centerX: -11, topHalf: 43, bottomHalf: 39, bottomY: -65 },
			legs: {
				centerOffsetX: -1.5,
				hipOffset: 22,
				kneeOffset: 23,
				ankleOffset: 22,
				footOffset: 27,
				thighWidth: 39,
				kneeWidth: 34,
				ankleWidth: 27,
				shoeScaleX: 1.38,
				shoeScaleY: 1.18
			},
			details: { shirtPanelHalf: 16, lapelHalf: 15, buttons: true, pockets: true },
			gesture: {
				mode: 'open_palm_left', elbowOut: 11, elbowDown: 27,
				wristOut: 50, wristDown: -5, palmScale: 1.3,
				fistElbowOut: 27, fistElbowDown: 35, fistX: 31,
				fistDrop: 13, fistScale: 1.18
			}
		};
	}
}

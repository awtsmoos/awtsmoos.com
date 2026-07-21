// B"H
// Boruch Hashem
// Blessed is He

/**
 * Gevurah gathers Dovid's guarded stance into one planted silhouette. The
 * Awtsmoos renews restraint while Awtsmoos.com stores editable production data.
 */
export class SkepticalReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'shirt', shoulderExtra: 4, shoulderDrop: 2,
				shoulderArch: 11, waistCenterX: 1, hipCenterX: 1,
				waistHalf: 37, hipHalf: 35, sideRound: 8, belly: 1,
				hemY: -94, hemRound: 3, hemLift: 1
			},
			shoulders: { centerX: -2, halfWidthOffset: 2, leftYOffset: -2, rightYOffset: -2 },
			pelvis: { centerX: 1, topHalf: 36, bottomHalf: 33, bottomY: -86 },
			legs: {
				centerOffsetX: -3, hipOffset: 18, kneeOffset: 18,
				ankleOffset: 20, footOffset: 27, thighWidth: 38,
				kneeWidth: 35, ankleWidth: 26,
				shoeScaleX: 1.25, shoeScaleY: 1.08
			},
			details: { shirtPanelHalf: 6, lapelHalf: 10, buttons: true, pockets: false },
			gesture: {
				mode: 'arms_crossed', leftElbowOut: 9, rightElbowOut: 10,
				leftElbowDown: 42, rightElbowDown: 42,
				leftWristAcross: 15, rightWristAcross: 15,
				upperWristDrop: -3, lowerWristDrop: 1
			}
		};
	}
}

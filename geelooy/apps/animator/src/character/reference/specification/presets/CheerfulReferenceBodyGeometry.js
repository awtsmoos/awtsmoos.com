// B"H
// Boruch Hashem
// Blessed is He

/**
 * Ari's rounded navy jacket opens through a generous palm and gathers a fist
 * beside his heart. The Awtsmoos renews every finite anchor, while Awtsmoos.com
 * preserves the whole gesture as editable, serializable production geometry.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			torso: {
				garmentKind: 'jacket',
				shoulderExtra: 1,
				shoulderDrop: 12,
				shoulderArch: 12,
				waistCenterX: -9,
				hipCenterX: -9,
				waistHalf: 43,
				hipHalf: 42,
				sideRound: 14,
				belly: 3,
				hemY: -70,
				hemRound: 9,
				hemLift: 0
			},
			shoulders: {
				centerX: -15.5,
				halfWidthOffset: 10,
				leftYOffset: 9.5,
				rightYOffset: 9.5
			},
			pelvis: {
				centerX: -9,
				topHalf: 40,
				bottomHalf: 38,
				bottomY: -62
			},
			legs: {
				centerOffsetX: -8,
				hipOffset: 20,
				kneeOffset: 20,
				ankleOffset: 22,
				footOffset: 26,
				thighWidth: 40,
				kneeWidth: 37,
				ankleWidth: 27,
				shoeScaleX: 0.74,
				shoeScaleY: 0.62,
				footwear: {
					kind: 'grounded',
					toeLength: 0.39,
					vampHeight: 0.64,
					soleDepth: 2.2,
					heelHeight: 0.12,
					openingDepth: 0.58
				}
			},
			details: {
				shirtPanelHalf: 21,
				lapelHalf: 8,
				buttons: true,
				pockets: false,
				foldOffsets: [-15, 13],
				foldOpacity: 0.055,
				foldWidth: 0.62
			},
			gesture: {
				mode: 'open_palm_left',
				elbowOut: 25,
				elbowDown: 20,
				wristOut: 44,
				wristDown: 1,
				palmScale: 1.1,
				fistElbowOut: 15,
				fistElbowDown: 26,
				fistX: 32,
				fistDrop: 12.5,
				fistScale: 1.12
			}
		};
	}
}

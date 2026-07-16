// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed widens the face, lifts the brows, opens the mouth, and lets peyot
 * dance beside a broad beard. The Awtsmoos renews each curve, while
 * Awtsmoos.com keeps Ari's likeness editable instead of flattening one smile.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.16,
				heightScale: 1.03,
				cheekScale: 1.12,
				jawScale: 0.92,
				chinScale: 0.68,
				lineWidth: 3.1
			},
			browStyle: {
				width: 18,
				thickness: 4.2,
				arch: 1.4,
				verticalOffset: -1.5
			},
			noseStyle: {
				sizeScale: 1.08,
				verticalOffset: 0.5,
				lineWidth: 2
			},
			eyeStyle: {
				widthScale: 1.46,
				heightScale: 1.42,
				spacingScale: 1.12,
				pupilScale: 0.96,
				outlineWidth: 2.2,
				lidWidth: 1.8,
				verticalOffset: -0.5
			},
			mouthStyle: {
				widthScale: 1.28,
				heightScale: 1.18,
				smileBias: 0.3,
				minimumOpen: 0.52,
				teeth: 0.86,
				tongue: true,
				lineWidth: 2.7,
				verticalOffset: 1
			},
			beardGeometry: {
				cheekScale: 0.8,
				topOffset: 5,
				mouthClearance: 12,
				lengthScale: 1.02,
				chinWidth: 24,
				taper: 0.88,
				bottomRoundness: 1.18,
				lineWidth: 2.5,
				strandOpacity: 0.1
			},
			payosGeometry: {
				rootOffsetX: 2,
				rootOffsetY: -1,
				amplitude: 17,
				secondAmplitude: 12,
				terminalCurl: 10,
				lengthScale: 1.05,
				lineWidth: 3.8
			},
			headwear: {
				type: 'kippah',
				size: 1.04,
				widthScale: 1.14,
				heightScale: 0.86,
				verticalOffset: -1,
				curvature: 0.62,
				tilt: -0.035,
				lineWidth: 2.4,
				highlightOpacity: 0.09
			},
			headTransform: {
				x: -1,
				y: -3,
				scaleX: 1.08,
				scaleY: 1.08
			}
		};
	}
}

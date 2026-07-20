// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed rounds Ari's cheeks, opens enormous friendly eyes, and gathers a broad
 * beard around a living laugh. The Awtsmoos renews each curve, while Awtsmoos.com
 * keeps likeness editable through production geometry and motion.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.15,
				heightScale: 1,
				foreheadScale: 0.74,
				templeScale: 0.96,
				cheekScale: 1.02,
				cheekYScale: 0.28,
				jawScale: 0.83,
				jawYScale: 0.73,
				chinScale: 0.46,
				earXScale: 0.97,
				earRX: 5.2,
				earRY: 8.7,
				shellScaleX: 1.1477,
				shellScaleY: 1.7563,
				shellOffsetX: -15.7649,
				shellOffsetY: 32.2706,
				featureOffsetX: -4.85,
				featureOffsetY: 37.5,
				featureScaleX: 1,
				featureScaleY: 1,
				lineWidth: 3
			},
			browStyle: {
				width: 20,
				thickness: 4.2,
				arch: 4.2,
				verticalOffset: -2
			},
			noseStyle: {
				sizeScale: 1.08,
				verticalOffset: 0.5,
				lineWidth: 1.9
			},
			eyeStyle: {
				radiusX: 12.4,
				radiusY: 12.6,
				spacingScale: 0.91,
				separationRatio: 0.9,
				pupilScale: 0.78,
				pupilVertical: 0.35,
				outlineWidth: 2,
				lidWidth: 1.6,
				verticalOffset: 1
			},
			mouthStyle: {
				widthScale: 2.05,
				heightScale: 1.68,
				smileBias: 0.56,
				minimumOpen: 0.88,
				teeth: 1,
				tongue: true,
				lineWidth: 2.7,
				horizontalOffset: -3.6,
				verticalOffset: 11.6
			},
			beardGeometry: {
				massStyle: 'continuous',
				cheekScale: 0.9,
				topOffset: 7,
				mouthVerticalOffset: 7.6,
				mouthClearance: 16,
				openingHeight: 14,
				moustacheHalf: 12,
				moustacheWidth: 4.4,
				lengthScale: 0.24,
				chinWidth: 28,
				taper: 1.05,
				bottomRoundness: 1.28,
				lineWidth: 2.5,
				strandOpacity: 0.06
			},
			payosGeometry: {
				rootScaleX: 0.88,
				rootOffsetX: -1,
				rootOffsetY: 0,
				amplitude: 8,
				secondAmplitude: 5,
				terminalCurl: 6,
				lengthScale: 0.72,
				lineWidth: 3.2
			},
			headwear: {
				type: 'kippah',
				size: 1.02,
				widthScale: 1.04,
				heightScale: 0.72,
				verticalOffset: -3,
				curvature: 0.62,
				tilt: -0.035,
				lineWidth: 2.3,
				highlightOpacity: 0.04
			},
			headTransform: {
				x: -1,
				y: -2,
				scaleX: 1.08,
				scaleY: 1.02
			}
		};
	}
}

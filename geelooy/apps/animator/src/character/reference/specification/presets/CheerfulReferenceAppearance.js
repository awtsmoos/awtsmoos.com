// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chesed rounds Ari's crown, cheeks, laugh, beard, and welcoming gaze. The
 * Awtsmoos renews each curve while Awtsmoos.com keeps controls editable.
 */
export class CheerfulReferenceAppearance {
	static create() {
		return {
			faceStyle: {
				widthScale: 1.15, heightScale: 1, foreheadScale: 0.9, templeScale: 0.99,
				cheekScale: 1, cheekYScale: 0.3, jawScale: 0.92, jawYScale: 0.76,
				chinScale: 0.62, earXScale: 0.96, earYScale: -0.01, earRX: 5.2,
				earRY: 8.7, shellScaleX: 1.1477, shellScaleY: 1.7563,
				shellOffsetX: -15.7649, shellOffsetY: 32.2706,
				featureOffsetX: -2.8, featureOffsetY: 37.5, lineWidth: 2.35
			},
			browStyle: { width: 19, thickness: 3.6, arch: 4.8, verticalOffset: -3 },
			noseStyle: { sizeScale: 1.08, verticalOffset: 0.5, lineWidth: 1.7 },
			eyeStyle: {
				radiusX: 11.8, radiusY: 12.4, spacingScale: 1.14,
				separationRatio: 0.79, pupilScale: 0.66, pupilVertical: 0.28,
				outlineWidth: 1.65, lidWidth: 1.35, verticalOffset: 1
			},
			mouthStyle: {
				widthScale: 1.58, heightScale: 1.55, smileBias: 0.68,
				minimumOpen: 0.82, minimumJaw: 0.72, minimumTeeth: 0.86,
				minimumTongue: 0.38, lineWidth: 2.1,
				horizontalOffset: -3.6, verticalOffset: 11.6
			},
			beardGeometry: {
				massStyle: 'continuous', cheekScale: 0.82, topOffset: 7,
				mouthVerticalOffset: 7.6, mouthClearance: 14, openingHeight: 11,
				moustacheHalf: 11, moustacheWidth: 3.2, lengthScale: 0.24,
				chinWidth: 30, taper: 1.04, bottomRoundness: 1.2,
				lineWidth: 2.15, strandOpacity: 0.06
			},
			payosGeometry: {
				rootScaleX: 0.9, rootOffsetX: -1, amplitude: 7,
				secondAmplitude: 4.5, terminalCurl: 5.5,
				lengthScale: 0.62, lineWidth: 2.8
			},
			headwear: {
				type: 'kippah', size: 1.02, widthScale: 1, heightScale: 0.92,
				verticalOffset: 5, curvature: 0.87, tilt: -0.035,
				lineWidth: 1.9, highlightOpacity: 0.04
			},
			headTransform: { x: -1, y: -2, scaleX: 1.08, scaleY: 1.02 }
		};
	}
}
